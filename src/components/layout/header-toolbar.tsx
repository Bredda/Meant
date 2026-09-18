import { Link } from "@tanstack/react-router";
import { MessageSquare, Search, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/utils/tailwind";
import { ThreadSheet } from "../thread/components/thread-sheet";
import ToggleTheme from "../toggle-theme";
import { Button, buttonVariants } from "../ui/button";

interface HeaderToolbar {
  className?: string;
}

export function HeaderToolbar({ className }: HeaderToolbar) {
  const [openThreadSheet, setOpenThreadSheet] = useState(false);

  const handleToggleThread = useCallback(
    () => setOpenThreadSheet((open) => !open),
    []
  );

  return (
    <>
      <div className={cn("flex gap-2", className)}>
        <Button size="icon" variant="secondary">
          <Search />
        </Button>
        <Button onClick={handleToggleThread} size="icon" variant="secondary">
          <MessageSquare />
        </Button>
        <ToggleTheme variant="secondary" />
        <Link
          className={buttonVariants({ size: "icon", variant: "secondary" })}
          search={{ tab: "ui-prefs" }}
          to="/settings"
        >
          <Settings />
        </Link>
      </div>
      <ThreadSheet onOpenChange={setOpenThreadSheet} open={openThreadSheet} />
    </>
  );
}
