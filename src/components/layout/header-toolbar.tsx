import { MessageSquare, Search, Settings } from "lucide-react";
import { cn } from "@/utils/tailwind";
import ToggleTheme from "../toggle-theme";
import { Button } from "../ui/button";

interface HeaderToolbar {
  className?: string;
}

export function HeaderToolbar({ className }: HeaderToolbar) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button size="icon" variant="secondary">
        <Search />
      </Button>
      <Button size="icon" variant="secondary">
        <MessageSquare />
      </Button>
      <ToggleTheme variant="secondary" />
      <Button size="icon" variant="secondary">
        <Settings />
      </Button>
    </div>
  );
}
