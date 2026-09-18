import type {
  ThreadAssistantMessage,
  ThreadToolCallMessage,
  ThreadToolResultMessage,
  ThreadUserMessage,
} from "@/ipc/agents/schema";

export interface RenderMessageItem {
  key: string;
  kind: "message";
  message: ThreadUserMessage | ThreadAssistantMessage;
}
export interface RenderToolItem {
  call: ThreadToolCallMessage;
  key: string;
  kind: "tool";
  result?: ThreadToolResultMessage;
}
/**
 * Regroups flats messages into items ready to be displayed
 *  - one "message" item for every user/assistant
 *  - one "tool" item grouping ThreadToolCall and ThreadToolResult (if it exists) via tool_call_id
 *
 * Works the same for live or persisted message historic
 */
export type RenderItem = RenderToolItem | RenderMessageItem;
