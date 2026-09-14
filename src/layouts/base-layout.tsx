import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DragWindowRegion title="electron-shadcn" />
      <main className="h-screen">
        <div className="[--header-height:calc(--spacing(14))]">
          <TooltipProvider>
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>
                  <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </div>
      </main>
    </>
  );
}
