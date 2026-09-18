import z from "zod";

export const reactAgentRunContextSchema = z.object({
  model: z.string(),
  runId: z.string(),
  threadId: z.string(),
  tools: z.array(z.any()),
});
export const reactAgentRunInputSchema = z.object({
  context: reactAgentRunContextSchema,
  input: z.string(),
});

export type ReactAgentRunInput = z.infer<typeof reactAgentRunInputSchema>;

const threadBaseMessageSchema = z.object({
  createdAt: z.number().optional(),
  id: z.string(),
  position: z.number(),
  threadId: z.string(),
});

const threadUserMessageSchema = threadBaseMessageSchema.extend({
  content: z.string(),
  role: z.literal("user"),
});
const threadAssistantMessageSchema = threadBaseMessageSchema.extend({
  content: z.string(),
  role: z.literal("assistant"),
});
const threadToolCallMessageSchema = threadBaseMessageSchema.extend({
  content: z.string(),
  role: z.literal("tool_call"),
  toolCallId: z.string(),
  toolName: z.string(),
});
const threadToolResultMessageSchema = threadBaseMessageSchema.extend({
  content: z.string(),
  role: z.literal("tool_result"),
  toolCallId: z.string(),
  toolName: z.string(),
});
export const threadMessageSchema = z.discriminatedUnion("role", [
  threadUserMessageSchema,
  threadAssistantMessageSchema,
  threadToolCallMessageSchema,
  threadToolResultMessageSchema,
]);

export type ThreadMessage = z.infer<typeof threadMessageSchema>;
export type ThreadUserMessage = z.infer<typeof threadUserMessageSchema>;

export type ThreadAssistantMessage = z.infer<
  typeof threadAssistantMessageSchema
>;
export type ThreadToolCallMessage = z.infer<typeof threadToolCallMessageSchema>;
export type ThreadToolResultMessage = z.infer<
  typeof threadToolResultMessageSchema
>;

export const threadSchema = z.object({
  createdAt: z.number(),
  id: z.string(),
  title: z.string(),
  updatedAt: z.number(),
});

export type Thread = z.infer<typeof threadSchema>;

const baseAgentEventDataSchema = z.object({ runId: z.string() });
export type BaseAgentEventData = z.infer<typeof baseAgentEventDataSchema>;

export const agentEventSchema = z.discriminatedUnion("type", [
  z.object({
    data: baseAgentEventDataSchema.extend({ chat: threadSchema }),
    type: z.literal("ChatCreated"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({ threadId: z.string() }),
    type: z.literal("RunStarted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      message_id: z.string(),
      threadId: z.string(),
    }),
    type: z.literal("MessageStarted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      message_id: z.string(),
      text: z.string(),
      threadId: z.string(),
    }),
    type: z.literal("MessageDelta"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      message_id: z.string(),
      threadId: z.string(),
    }),
    type: z.literal("MessageCompleted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      arguments: z.string(),
      threadId: z.string(),
      tool_call_id: z.string(),
      tool_name: z.string(),
    }),
    type: z.literal("ToolCallStarted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      content: z.string(),
      is_error: z.boolean(),
      threadId: z.string(),
      tool_call_id: z.string(),
      tool_name: z.string(),
    }),
    type: z.literal("ToolCallCompleted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      messages: z.array(threadMessageSchema),
      threadId: z.string(),
    }),
    type: z.literal("RunCompleted"),
  }),
  z.object({
    data: baseAgentEventDataSchema.extend({
      message: z.string(),
      threadId: z.string().optional(),
    }),
    type: z.literal("Error"),
  }),
]);

export type AgentEvent = z.infer<typeof agentEventSchema>;
