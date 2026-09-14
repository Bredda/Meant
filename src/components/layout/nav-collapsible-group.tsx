"use client";

import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import type { Menu } from "./app-sidebar";

function NavWithSidebarCollapsed({ menu }: { menu: Menu }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          {menu.items.map((item) => (
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

function NavWithSidebarExpanded({ menu }: { menu: Menu }) {
  return (
    <Collapsible
      className="group/collapsible"
      defaultOpen
      key={menu.title}
      title={menu.title}
    >
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-muted-foreground text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger>
            {menu.title}{" "}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive} size="sm">
                    <a className="ml-2" href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function NavCollapsibleGroup({ menu }: { menu: Menu }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <>
      {isCollapsed ? (
        <NavWithSidebarCollapsed menu={menu} />
      ) : (
        <NavWithSidebarExpanded menu={menu} />
      )}
    </>
  );
}
