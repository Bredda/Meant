import z from "zod";

export const modelConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().optional(),
});

export type ModelConfig = z.infer<typeof modelConfigSchema>;

export const agentConfigSchema = modelConfigSchema.extend({
  tools: z.array(z.any()),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;
