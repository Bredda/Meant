import { os } from "@orpc/server";
import { z } from "zod";
import { threadMessageSchema, threadSchema } from "@/ipc/agents/schema";
import { getThread, getThreadMessages, listThreads } from "@/services/threads";
import { threadIdInputSchema } from "./schema";

export const list = os
  .output(z.array(threadSchema))
  .handler(() => listThreads());

export const get = os
  .input(threadIdInputSchema)
  .output(threadSchema.nullable())
  .handler(({ input }) => getThread(input.threadId));

export const getMessages = os
  .input(threadIdInputSchema)
  .output(z.array(threadMessageSchema))
  .handler(({ input }) => getThreadMessages(input.threadId));
