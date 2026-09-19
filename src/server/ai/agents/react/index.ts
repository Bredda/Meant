import { randomUUID } from "node:crypto";
import type { BaseMessage } from "@langchain/core/messages";
import {
  type GraphRunStream,
  StateGraph,
  type ToolCallStream,
} from "@langchain/langgraph";
import { createToolCallTransformer } from "langchain";
import type { AgentEvent, ReactAgentRunInput } from "@/ipc/agents/schema";
import {
  appendMessages,
  createThread,
  deriveThreadTitle,
  getThread,
  getThreadMessages,
  touchThread,
} from "@/server/services/threads-service";
import {
  toBaseMessages,
  toChatMessages,
  toolMessageToString,
} from "../../utils/message-transformer";
import { createTaskGroup } from "../../utils/streaming";
import { agent, shouldContinue, toolNode } from "./nodes";
import { agentContextSchema, agentStateSchema } from "./state";

const reactAgent = new StateGraph(agentStateSchema, agentContextSchema)
  .addNode("agent", agent)
  .addNode("toolNode", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, ["toolNode", "__end__"])
  .addEdge("toolNode", "agent")
  .compile({ transformers: [createToolCallTransformer([])] });

// `createToolCallTransformer` is a *native* transformer: it assigns `toolCalls`
// directly on the returned `GraphRunStream` instance (not under `.extensions`),
// which the generic `streamEvents` return type doesn't model.
type ReactAgentRun = GraphRunStream<{ messages: BaseMessage[] }> & {
  toolCalls: AsyncIterable<ToolCallStream>;
};

export async function* streamReactAgentRun(
  { input, context: { runId, threadId, model, tools } }: ReactAgentRunInput,
  { signal }: { signal?: AbortSignal } = {}
): AsyncGenerator<AgentEvent> {
  signal?.throwIfAborted();

  const thread = await getThread(threadId);
  const priorMessages = thread ? await getThreadMessages(threadId) : [];
  if (!thread) {
    const created = await createThread({
      id: threadId,
      title: deriveThreadTitle(input),
    });
    yield { data: { chat: created, runId }, type: "ChatCreated" };
  }

  yield { data: { runId, threadId }, type: "RunStarted" };

  const run = (await reactAgent.streamEvents(
    {
      messages: [
        ...toBaseMessages(priorMessages),
        { content: input, role: "user" },
      ],
    },
    { context: { model, temperature: 0.7, tools }, signal, version: "v3" }
  )) as unknown as ReactAgentRun;

  const events = createTaskGroup<AgentEvent>();

  events.fork(async () => {
    for await (const message of run.messages) {
      const messageId = randomUUID();
      events.push({
        data: { message_id: messageId, runId, threadId },
        type: "MessageStarted",
      });
      events.fork(async () => {
        for await (const delta of message.text) {
          events.push({
            data: {
              message_id: messageId,
              runId,
              text: delta,
              threadId,
            },
            type: "MessageDelta",
          });
        }
        events.push({
          data: { message_id: messageId, runId, threadId },
          type: "MessageCompleted",
        });
      });
    }
  });

  events.fork(async () => {
    for await (const call of run.toolCalls) {
      events.push({
        data: {
          arguments: JSON.stringify(call.input),
          runId,
          threadId,
          tool_call_id: call.callId,
          tool_name: call.name,
        },
        type: "ToolCallStarted",
      });
      events.fork(async () => {
        const [status, error, output] = await Promise.all([
          call.status,
          call.error,
          call.output.catch(() => undefined),
        ]);
        const content =
          status === "error" ? (error ?? "") : toolMessageToString(output);
        events.push({
          data: {
            content,
            is_error: status === "error",
            runId,
            threadId,
            tool_call_id: call.callId,
            tool_name: call.name,
          },
          type: "ToolCallCompleted",
        });
      });
    }
  });

  try {
    yield* events;
    const finalState = await run.output;
    const newMessages = toChatMessages(
      finalState.messages.slice(priorMessages.length),
      threadId,
      priorMessages.length
    );
    await appendMessages(newMessages);
    await touchThread(threadId);
    yield {
      data: {
        messages: newMessages,
        runId,
        threadId,
      },
      type: "RunCompleted",
    };
  } catch (err) {
    yield {
      data: {
        message: err instanceof Error ? err.message : String(err),
        runId,
        threadId,
      },
      type: "Error",
    };
  }
}
