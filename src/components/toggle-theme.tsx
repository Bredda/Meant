import type { VariantProps } from "class-variance-authority";
import { Moon, Sun } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export default function ToggleTheme({
  variant = "default",
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <Button onClick={toggleTheme} size="icon" variant={variant}>
      {resolvedTheme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </Button>
  );
}
