import type { VariantProps } from "class-variance-authority";
import { Moon, Sun } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useResolvedTheme, useSettingsStore } from "@/stores/settings-store";

export default function ToggleTheme({
  variant = "default",
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  const resolvedTheme = useResolvedTheme();
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  return (
    <Button onClick={toggleTheme} size="icon" variant={variant}>
      {resolvedTheme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </Button>
  );
}
