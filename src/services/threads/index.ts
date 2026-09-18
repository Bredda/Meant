import { asc, desc, eq } from "drizzle-orm";
import type { Thread, ThreadMessage } from "@/ipc/agents/schema";
import { db } from "@/server/db/client";
import { messages, threads } from "@/server/db/schema";

const TITLE_MAX_LENGTH = 60;

export function deriveThreadTitle(input: string): string {
  const trimmed = input.trim();
  return trimmed.length > TITLE_MAX_LENGTH
    ? `${trimmed.slice(0, TITLE_MAX_LENGTH - 1)}…`
    : trimmed;
}

export async function getThread(id: string): Promise<Thread | null> {
  const [thread] = await db.select().from(threads).where(eq(threads.id, id));
  return thread ?? null;
}

export function listThreads(): Promise<Thread[]> {
  return db.select().from(threads).orderBy(desc(threads.updatedAt));
}

export async function createThread(input: {
  id: string;
  title: string;
}): Promise<Thread> {
  const now = Date.now();
  const thread: Thread = {
    createdAt: now,
    id: input.id,
    title: input.title,
    updatedAt: now,
  };
  await db.insert(threads).values(thread);
  return thread;
}

export async function touchThread(id: string): Promise<void> {
  await db
    .update(threads)
    .set({ updatedAt: Date.now() })
    .where(eq(threads.id, id));
}

function rowToThreadMessage(row: typeof messages.$inferSelect): ThreadMessage {
  const base = {
    createdAt: row.createdAt,
    id: row.id,
    position: row.position,
    threadId: row.threadId,
  };

  switch (row.role) {
    case "user":
      return { ...base, content: row.content, role: "user" };
    case "assistant":
      return { ...base, content: row.content, role: "assistant" };
    case "tool_call":
      return {
        ...base,
        content: row.content,
        role: "tool_call",
        toolCallId: row.toolCallId ?? "",
        toolName: row.toolName ?? "",
      };
    case "tool_result":
      return {
        ...base,
        content: row.content,
        role: "tool_result",
        toolCallId: row.toolCallId ?? "",
        toolName: row.toolName ?? "",
      };
    default:
      throw new Error(`Unknown persisted message role: ${row.role}`);
  }
}

function threadMessageToRow(
  message: ThreadMessage
): typeof messages.$inferInsert {
  return {
    content: message.content,
    createdAt: message.createdAt ?? Date.now(),
    id: message.id,
    position: message.position,
    role: message.role,
    threadId: message.threadId,
    toolCallId: "toolCallId" in message ? message.toolCallId : null,
    toolName: "toolName" in message ? message.toolName : null,
  };
}

export async function getThreadMessages(
  threadId: string
): Promise<ThreadMessage[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.position));
  return rows.map(rowToThreadMessage);
}

export async function appendMessages(
  newMessages: ThreadMessage[]
): Promise<void> {
  if (newMessages.length === 0) {
    return;
  }
  await db.insert(messages).values(newMessages.map(threadMessageToRow));
}
