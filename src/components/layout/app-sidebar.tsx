import {
  BookOpenIcon,
  BotIcon,
  ChartLine,
  FrameIcon,
  Home,
  Library,
  LifeBuoyIcon,
  LightbulbIcon,
  MapIcon,
  PieChartIcon,
  Search,
  SendIcon,
  Settings2Icon,
  TerminalSquareIcon,
} from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavSecondary } from "@/components/layout/nav-secondary";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavCollapsibleGroup } from "./nav-collapsible-group";

const data = {
  navMain: [
    {
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
      title: "Playground",
      url: "#",
    },
    {
      icon: <BotIcon />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
      title: "Models",
      url: "#",
    },
    {
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
      title: "Documentation",
      url: "#",
    },
    {
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
      title: "Settings",
      url: "#",
    },
  ],
  navSecondary: [
    {
      icon: <LifeBuoyIcon />,
      title: "Support",
      url: "#",
    },
    {
      icon: <SendIcon />,
      title: "Feedback",
      url: "#",
    },
  ],
  projects: [
    {
      icon: <FrameIcon />,
      name: "Design Engineering",
      url: "#",
    },
    {
      icon: <PieChartIcon />,
      name: "Sales & Marketing",
      url: "#",
    },
    {
      icon: <MapIcon />,
      name: "Travel",
      url: "#",
    },
  ],
  user: {
    avatar: "/avatars/shadcn.jpg",
    email: "m@example.com",
    name: "shadcn",
  },
};

const main = [
  {
    icon: <Home />,
    title: "Home",
    url: "/",
  },
  {
    icon: <Library />,
    title: "Library",
    url: "/library",
  },
];

export interface Menu {
  isActive?: boolean;
  items: {
    title: string;
    url: string;
    isActive: boolean;
    icon: React.ReactNode;
  }[];
  title: string;
  url: string;
}

const explore: Menu = {
  isActive: true,
  items: [
    {
      icon: <Search />,
      isActive: false,
      title: "Search",
      url: "#",
    },
    {
      icon: <ChartLine />,
      isActive: false,
      title: "Graph",
      url: "#",
    },
    {
      icon: <MapIcon />,
      isActive: false,
      title: "Argmuent Map",
      url: "#",
    },
    {
      icon: <LightbulbIcon />,
      isActive: false,
      title: "Ideas",
      url: "#",
    },
    { icon: <BookOpenIcon />, isActive: false, title: "Author", url: "#" },
  ],
  title: "Explore",
  url: "#",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
      {...props}
    >
      <SidebarContent className="mt-12">
        <NavMain items={main} />
        <NavCollapsibleGroup menu={explore} />
        <NavProjects projects={data.projects} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
