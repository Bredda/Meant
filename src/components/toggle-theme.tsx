import type { VariantProps } from "class-variance-authority";
import { Moon, Sun } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export default function ToggleTheme({
  variant = "default",
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button onClick={toggleTheme} size="icon" variant={variant}>
      {theme === "light" && <Moon size={16} />}
      {theme === "dark" && <Sun size={16} />}
    </Button>
  );
}
