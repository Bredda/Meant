import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Activity } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { inDevelopment } from "@/constants";
import BaseLayout from "@/layouts/base-layout";

function Root() {
  return (
    <ThemeProvider>
      <BaseLayout>
        <Outlet />
        <Activity mode={inDevelopment ? "visible" : "hidden"}>
          <TanStackRouterDevtools />
        </Activity>
      </BaseLayout>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: Root,
});
