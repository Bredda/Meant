import { expect, test } from "vitest";
import type { AgentEvent } from "@/ipc/agents/schema";
import { type RunStreamState, reduceAgentEvent } from "@/stores/threads-store";

const RUN_ID = "run-1";
const THREAD_ID = "thread-1";

function emptyState(): RunStreamState {
  return { error: null, items: [], runId: RUN_ID };
}

test("accumulates message deltas and marks completion", () => {
  const events: AgentEvent[] = [
    {
      data: { message_id: "m1", runId: RUN_ID, threadId: THREAD_ID },
      type: "MessageStarted",
    },
    {
      data: {
        message_id: "m1",
        runId: RUN_ID,
        text: "Hel",
        threadId: THREAD_ID,
      },
      type: "MessageDelta",
    },
    {
      data: {
        message_id: "m1",
        runId: RUN_ID,
        text: "lo",
        threadId: THREAD_ID,
      },
      type: "MessageDelta",
    },
    {
      data: { message_id: "m1", runId: RUN_ID, threadId: THREAD_ID },
      type: "MessageCompleted",
    },
  ];

  const final = events.reduce(reduceAgentEvent, emptyState());

  expect(final.items).toEqual([
    { done: true, id: "m1", kind: "message", text: "Hello" },
  ]);
});

test("tracks a tool call from start to completion", () => {
  const events: AgentEvent[] = [
    {
      data: {
        arguments: '{"city":"Paris"}',
        runId: RUN_ID,
        threadId: THREAD_ID,
        tool_call_id: "call-1",
        tool_name: "weather",
      },
      type: "ToolCallStarted",
    },
    {
      data: {
        content: "18°C",
        is_error: false,
        runId: RUN_ID,
        threadId: THREAD_ID,
        tool_call_id: "call-1",
        tool_name: "weather",
      },
      type: "ToolCallCompleted",
    },
  ];

  const final = events.reduce(reduceAgentEvent, emptyState());

  expect(final.items).toEqual([
    {
      arguments: '{"city":"Paris"}',
      content: "18°C",
      done: true,
      id: "call-1",
      isError: false,
      kind: "toolCall",
      name: "weather",
    },
  ]);
});

test("records an error", () => {
  const final = reduceAgentEvent(emptyState(), {
    data: { message: "boom", runId: RUN_ID, threadId: THREAD_ID },
    type: "Error",
  });

  expect(final.error).toBe("boom");
});

test("preserves arrival order across interleaved messages and tool calls", () => {
  const events: AgentEvent[] = [
    {
      data: { message_id: "m1", runId: RUN_ID, threadId: THREAD_ID },
      type: "MessageStarted",
    },
    {
      data: {
        arguments: "{}",
        runId: RUN_ID,
        threadId: THREAD_ID,
        tool_call_id: "call-1",
        tool_name: "weather",
      },
      type: "ToolCallStarted",
    },
    {
      data: {
        message_id: "m2",
        runId: RUN_ID,
        threadId: THREAD_ID,
      },
      type: "MessageStarted",
    },
  ];

  const final = events.reduce(reduceAgentEvent, emptyState());

  expect(final.items.map((item) => [item.kind, item.id])).toEqual([
    ["message", "m1"],
    ["toolCall", "call-1"],
    ["message", "m2"],
  ]);
});

test("only updates the targeted item when several are streaming", () => {
  let state = emptyState();
  state = reduceAgentEvent(state, {
    data: { message_id: "m1", runId: RUN_ID, threadId: THREAD_ID },
    type: "MessageStarted",
  });
  state = reduceAgentEvent(state, {
    data: { message_id: "m2", runId: RUN_ID, threadId: THREAD_ID },
    type: "MessageStarted",
  });
  state = reduceAgentEvent(state, {
    data: { message_id: "m2", runId: RUN_ID, text: "hi", threadId: THREAD_ID },
    type: "MessageDelta",
  });

  expect(state.items).toEqual([
    { done: false, id: "m1", kind: "message", text: "" },
    { done: false, id: "m2", kind: "message", text: "hi" },
  ]);
});
