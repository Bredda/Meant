import z from "zod";

export const threadIdInputSchema = z.object({
  threadId: z.string(),
});
