import { randomUUID } from "node:crypto";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
  ToolMessage,
} from "langchain";
import type { ThreadMessage } from "@/ipc/agents/schema";

export function toChatMessages(
  messages: BaseMessage[],
  threadId: string,
  startPosition = 0
): ThreadMessage[] {
  const flattened = messages.flatMap((message): ThreadMessage[] => {
    const base = {
      createdAt: Date.now(),
      id: randomUUID(),
      position: 0,
      threadId,
    };
    if (HumanMessage.isInstance(message)) {
      return [{ ...base, content: String(message.content), role: "user" }];
    }
    if (AIMessage.isInstance(message)) {
      const text = message.text
        ? [{ ...base, content: message.text, role: "assistant" as const }]
        : [];
      const toolCalls = (message.tool_calls ?? []).map((call) => ({
        ...base,
        content: JSON.stringify(call.args),
        id: randomUUID(),
        role: "tool_call" as const,
        toolCallId: call.id ?? randomUUID(),
        toolName: call.name,
      }));
      return [...text, ...toolCalls];
    }
    if (ToolMessage.isInstance(message)) {
      return [
        {
          ...base,
          content: String(message.content),
          role: "tool_result",
          toolCallId: message.tool_call_id,
          toolName: message.name ?? "",
        },
      ];
    }
    return [];
  });

  return flattened.map((message, index) => ({
    ...message,
    position: startPosition + index,
  }));
}

// Reverses `toChatMessages`. Each tool call becomes its own
// assistant-then-tool pair rather than regrouping consecutive tool calls
// back onto a single AIMessage: it's lossy for "parallel" tool calls (the
// model won't see them as originally simultaneous on replay) but keeps the
// round-trip simple and always valid, since every tool_call_id stays
// immediately paired with its result.
export function toBaseMessages(messages: ThreadMessage[]): BaseMessage[] {
  return messages.map((message) => {
    switch (message.role) {
      case "user":
        return new HumanMessage({ content: message.content });
      case "assistant":
        return new AIMessage({ content: message.content });
      case "tool_call":
        return new AIMessage({
          content: "",
          tool_calls: [
            {
              args: JSON.parse(message.content),
              id: message.toolCallId,
              name: message.toolName,
            },
          ],
        });
      case "tool_result":
        return new ToolMessage({
          content: message.content,
          name: message.toolName,
          tool_call_id: message.toolCallId,
        });
      default:
        throw new Error(
          `Unknown thread message role: ${(message as ThreadMessage).role}`
        );
    }
  });
}

export const toolMessageToString = (output: unknown) =>
  ToolMessage.isInstance(output)
    ? String(output.content)
    : JSON.stringify(output);
