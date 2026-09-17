import { Brain, PanelLeftIcon, PanelRight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getAppVersion } from "@/actions/app";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { HeaderToolbar } from "./header-toolbar";

export function SiteHeader() {
  const [appVersion, setAppVersion] = useState("0.0.0");
  const [, startGetAppVersion] = useTransition();
  const { state, toggleSidebar } = useSidebar();
  const isExpanded = state === "expanded";
  useEffect(
    () => startGetAppVersion(() => getAppVersion().then(setAppVersion)),
    []
  );

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Brain className="size-4" />
          </div>
          <span className="font-bold text-primary">Meant.</span>
          <span className="text-muted-foreground text-xs">v{appVersion}</span>
        </div>
        <Separator
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          orientation="vertical"
        />
        <Button
          className="ml-auto w-fit"
          onClick={toggleSidebar}
          variant="outline"
        >
          {isExpanded ? <PanelLeftIcon /> : <PanelRight />}
        </Button>
        <span className="flex-1" />
        <HeaderToolbar className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
