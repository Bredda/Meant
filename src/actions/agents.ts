import type { ReactAgentRunInput } from "@/ipc/agents/schema";
import { ipc } from "@/ipc/manager";

export function runReactAgent(
  input: ReactAgentRunInput,
  options?: { signal?: AbortSignal }
) {
  return ipc.client.agents.runReactAgent(input, options);
}
