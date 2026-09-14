"use client";

import { PanelLeftIcon, PanelRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { state, toggleSidebar } = useSidebar();
  const isExpanded = state === "expanded";
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenuItem>
          <SidebarMenuButton className="ml-auto w-fit" onClick={toggleSidebar}>
            {isExpanded ? <PanelLeftIcon /> : <PanelRight />}
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
