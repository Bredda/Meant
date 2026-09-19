import { create } from "zustand/react";
import { listAvailableLlms } from "@/actions/ai-providers";
import type { LlmModel } from "@/types/ai-model";

interface ModelsState {
  llms: LlmModel[];
  load: () => Promise<void>;
}

export const useModelStore = create<ModelsState>((set, _) => ({
  llms: [],

  load: async () => {
    const llms = await listAvailableLlms();
    set({ llms });
  },
}));
