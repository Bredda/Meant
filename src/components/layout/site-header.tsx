import { Brain } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HeaderToolbar } from "./header-toolbar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Brain className="size-4" />
          </div>
          <span className="font-bold text-primary">Meant.</span>
        </div>

        <Separator
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          orientation="vertical"
        />

        <HeaderToolbar className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
