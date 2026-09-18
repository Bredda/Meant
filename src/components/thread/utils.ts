import type { ThreadMessage } from "@/ipc/agents/schema";
import type { RunStreamState } from "@/stores/threads-store";
import type { RenderItem } from "./types";

/**
 * Transforms a list of ThreadMessage into a list of RenderItem
 * ready to be displayed
 *
 *  - one "message" item for every user/assistant
 *  - one "tool" item grouping ThreadToolCall and ThreadToolResult (if it exists) via tool_call_id
 *
 * Works the same for live or persisted message historic
 * @param messages
 * @returns
 */
export function groupMessages(messages: ThreadMessage[]): RenderItem[] {
  const items: RenderItem[] = [];
  const toolItemIndexByCallId = new Map<string, number>();

  for (const message of messages) {
    switch (message.role) {
      case "user":
      case "assistant": {
        items.push({ key: message.id, kind: "message", message });
        break;
      }

      case "tool_call": {
        toolItemIndexByCallId.set(message.toolCallId, items.length);
        items.push({ call: message, key: message.toolCallId, kind: "tool" });
        break;
      }

      case "tool_result": {
        const index = toolItemIndexByCallId.get(message.toolCallId);
        const existing = index === undefined ? undefined : items[index];

        if (existing?.kind === "tool" && index !== undefined) {
          items[index] = { ...existing, result: message };
        }
        // We should not have a tool_result without its corresponding tool_call
        // if this is the case we silently ignore it
        // rather than crashing render

        break;
      }
      default:
        console.warn("Unknown message type", message);
    }
  }

  return items;
}

/**
 * Appends the live, in-flight items of an active run (still being streamed)
 * after a thread's persisted messages, so the UI can render both as a single
 * continuous list while a run is in progress.
 */
export function mergeStreamingMessages(
  threadId: string,
  persisted: ThreadMessage[],
  streaming: RunStreamState | undefined
): ThreadMessage[] {
  if (!streaming) {
    return persisted;
  }

  let position = persisted.length;
  const live: ThreadMessage[] = [];

  for (const item of streaming.items) {
    if (item.kind === "message") {
      live.push({
        content: item.text,
        id: item.id,
        position,
        role: "assistant",
        threadId,
      });
      position += 1;
      continue;
    }

    live.push({
      content: item.arguments,
      id: item.id,
      position,
      role: "tool_call",
      threadId,
      toolCallId: item.id,
      toolName: item.name,
    });
    position += 1;
    if (item.done) {
      live.push({
        content: item.content ?? "",
        id: `${item.id}-result`,
        position,
        role: "tool_result",
        threadId,
        toolCallId: item.id,
        toolName: item.name,
      });
      position += 1;
    }
  }

  return [...persisted, ...live];
}
