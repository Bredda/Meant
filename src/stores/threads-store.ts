import { create } from "zustand";
import { runReactAgent } from "@/actions/agents";
import {
  getThreadMessages as fetchThreadMessages,
  listThreads as fetchThreads,
} from "@/actions/threads";
import type { AgentEvent, Thread, ThreadMessage } from "@/ipc/agents/schema";

export type StreamingItem =
  | {
      done: boolean;
      id: string;
      kind: "message";
      text: string;
    }
  | {
      arguments: string;
      content: string | null;
      done: boolean;
      id: string;
      isError: boolean;
      kind: "toolCall";
      name: string;
    };

export interface RunStreamState {
  error: string | null;
  items: StreamingItem[];
  runId: string;
}

export function reduceAgentEvent(
  current: RunStreamState,
  event: AgentEvent
): RunStreamState {
  switch (event.type) {
    case "MessageStarted":
      return {
        ...current,
        items: [
          ...current.items,
          { done: false, id: event.data.message_id, kind: "message", text: "" },
        ],
      };
    case "MessageDelta":
      return {
        ...current,
        items: current.items.map((item) =>
          item.kind === "message" && item.id === event.data.message_id
            ? { ...item, text: item.text + event.data.text }
            : item
        ),
      };
    case "MessageCompleted":
      return {
        ...current,
        items: current.items.map((item) =>
          item.kind === "message" && item.id === event.data.message_id
            ? { ...item, done: true }
            : item
        ),
      };
    case "ToolCallStarted":
      return {
        ...current,
        items: [
          ...current.items,
          {
            arguments: event.data.arguments,
            content: null,
            done: false,
            id: event.data.tool_call_id,
            isError: false,
            kind: "toolCall",
            name: event.data.tool_name,
          },
        ],
      };
    case "ToolCallCompleted":
      return {
        ...current,
        items: current.items.map((item) =>
          item.kind === "toolCall" && item.id === event.data.tool_call_id
            ? {
                ...item,
                content: event.data.content,
                done: true,
                isError: event.data.is_error,
              }
            : item
        ),
      };
    case "Error":
      return { ...current, error: event.data.message };
    default:
      return current;
  }
}

function emptyRunStreamState(runId: string): RunStreamState {
  return { error: null, items: [], runId };
}

export interface SendMessageInput {
  input: string;
  model: string;
  threadId: string;
  tools: unknown[];
}

interface ThreadsState {
  abortControllers: Record<string, AbortController>;
  cancelRun: (threadId: string) => void;
  loadThreadMessages: (threadId: string) => Promise<void>;
  loadThreads: () => Promise<void>;
  messages: Record<string, ThreadMessage[]>;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  streaming: Record<string, RunStreamState>;
  threads: Thread[];
}

export const useThreadsStore = create<ThreadsState>((set, get) => ({
  abortControllers: {},

  cancelRun: (threadId) => {
    get().abortControllers[threadId]?.abort();
  },

  loadThreadMessages: async (threadId) => {
    const threadMessages = await fetchThreadMessages(threadId);
    set((state) => ({
      messages: { ...state.messages, [threadId]: threadMessages },
    }));
  },

  loadThreads: async () => {
    const threads = await fetchThreads();
    set({ threads });
  },

  messages: {},

  sendMessage: async ({ threadId, input, model, tools }) => {
    const runId = crypto.randomUUID();
    const controller = new AbortController();

    set((state) => ({
      abortControllers: { ...state.abortControllers, [threadId]: controller },
      streaming: {
        ...state.streaming,
        [threadId]: emptyRunStreamState(runId),
      },
    }));

    try {
      const stream = await runReactAgent(
        { context: { model, runId, threadId, tools }, input },
        { signal: controller.signal }
      );

      for await (const event of stream) {
        if (event.type === "ChatCreated") {
          set((state) => ({ threads: [event.data.chat, ...state.threads] }));
          continue;
        }
        if (event.type === "RunCompleted") {
          set((state) => {
            const streaming = { ...state.streaming };
            delete streaming[threadId];
            return {
              messages: {
                ...state.messages,
                [threadId]: [
                  ...(state.messages[threadId] ?? []),
                  ...event.data.messages,
                ],
              },
              streaming,
            };
          });
          continue;
        }
        if (event.type === "RunStarted") {
          continue;
        }
        set((state) => {
          const current = state.streaming[threadId];
          return current
            ? {
                streaming: {
                  ...state.streaming,
                  [threadId]: reduceAgentEvent(current, event),
                },
              }
            : state;
        });
      }
    } finally {
      // On success, RunCompleted already cleared `streaming[threadId]`
      // above. On error, it's left in place (with `.error` set) so the UI
      // can show what went wrong instead of the run vanishing silently.
      set((state) => {
        const abortControllers = { ...state.abortControllers };
        delete abortControllers[threadId];
        return { abortControllers };
      });
    }
  },

  streaming: {},

  threads: [],
}));
