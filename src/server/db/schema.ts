import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  createdAt: integer("created_at").notNull(),
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
  id: text("id").primaryKey(),
  position: integer("position").notNull(),
  role: text("role").notNull(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  toolCallId: text("tool_call_id"),
  toolName: text("tool_name"),
});
