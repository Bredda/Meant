import { AIMessage, HumanMessage, ToolMessage } from "langchain";
import { expect, test } from "vitest";
import {
  toBaseMessages,
  toChatMessages,
} from "@/server/ai/utils/message-transformer";

const THREAD_ID = "thread-1";

test("flattens a tool-calling exchange into ordered ThreadMessage rows", () => {
  const messages = [
    new HumanMessage({ content: "what's the weather in Paris?" }),
    new AIMessage({
      content: "",
      tool_calls: [{ args: { city: "Paris" }, id: "call-1", name: "weather" }],
    }),
    new ToolMessage({ content: "18°C", name: "weather", tool_call_id: "call-1" }),
    new AIMessage({ content: "It's 18°C in Paris." }),
  ];

  const threadMessages = toChatMessages(messages, THREAD_ID);

  expect(threadMessages.map((m) => m.role)).toEqual([
    "user",
    "tool_call",
    "tool_result",
    "assistant",
  ]);
  expect(threadMessages.map((m) => m.position)).toEqual([0, 1, 2, 3]);
  expect(threadMessages.every((m) => m.threadId === THREAD_ID)).toBe(true);
});

test("continues positions from a given startPosition", () => {
  const messages = [new HumanMessage({ content: "hi" })];

  const threadMessages = toChatMessages(messages, THREAD_ID, 5);

  expect(threadMessages[0]?.position).toBe(5);
});

test("round-trips user/assistant/tool_call/tool_result back to equivalent BaseMessages", () => {
  const original = [
    new HumanMessage({ content: "what's the weather in Paris?" }),
    new AIMessage({
      content: "",
      tool_calls: [{ args: { city: "Paris" }, id: "call-1", name: "weather" }],
    }),
    new ToolMessage({ content: "18°C", name: "weather", tool_call_id: "call-1" }),
    new AIMessage({ content: "It's 18°C in Paris." }),
  ];

  const roundTripped = toBaseMessages(toChatMessages(original, THREAD_ID));

  expect(roundTripped).toHaveLength(original.length);

  const [human, toolCallAi, toolResult, textAi] = roundTripped;
  expect(HumanMessage.isInstance(human)).toBe(true);
  expect(String(human?.content)).toBe("what's the weather in Paris?");

  expect(AIMessage.isInstance(toolCallAi)).toBe(true);
  expect((toolCallAi as AIMessage).tool_calls).toEqual([
    { args: { city: "Paris" }, id: "call-1", name: "weather" },
  ]);

  expect(ToolMessage.isInstance(toolResult)).toBe(true);
  expect(String(toolResult?.content)).toBe("18°C");
  expect((toolResult as ToolMessage).tool_call_id).toBe("call-1");

  expect(AIMessage.isInstance(textAi)).toBe(true);
  expect(String(textAi?.content)).toBe("It's 18°C in Paris.");
});
