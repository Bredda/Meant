import { MessagesValue, StateSchema } from "@langchain/langgraph";
import { type AgentConfig, agentConfigSchema } from "@/types/agents";

// Graph state
export const agentStateSchema = new StateSchema({
  messages: MessagesValue,
});

export type AgentState = typeof agentStateSchema;

export const agentContextSchema = agentConfigSchema;
export type AgentContext = AgentConfig;
