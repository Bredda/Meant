import { useEffect } from "react";
import { useModelStore } from "@/stores/model-store";

interface ModelsProviderProps {
  children: React.ReactNode;
}

export function ModelsProvider({ children }: ModelsProviderProps) {
  const load = useModelStore((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);

  return children;
}
