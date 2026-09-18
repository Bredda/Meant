import { eventIterator, os } from "@orpc/server";
import { streamReactAgentRun } from "@/server/ai/agents/react";
import { agentEventSchema, reactAgentRunInputSchema } from "./schema";

export const runReactAgent = os
  .input(reactAgentRunInputSchema)
  .output(eventIterator(agentEventSchema))
  .handler(({ input, signal }) => streamReactAgentRun(input, { signal }));
