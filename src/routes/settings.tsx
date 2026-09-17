import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Info, Settings2, Squirrel } from "lucide-react";
import { useCallback } from "react";
import { z } from "zod";
import { AiProviderSettings } from "@/components/ai-provider-settings";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { icon: Settings2, label: "UI preferences", to: "ui-prefs" },
  { icon: BrainCircuit, label: "AI providers", to: "ai-providers" },
  { icon: Info, label: "About Meant", to: "about" },
  { icon: Squirrel, label: "Updates and changelog", to: "updates" },
] as const;

const tabValues = categories.map((c) => c.to);

const settingsSearchSchema = z.object({
  tab: z.enum(tabValues).catch(categories[0].to),
});

function SettingsPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleTabChange = useCallback(
    (value: string) => {
      navigate({ search: { tab: value as (typeof tabValues)[number] } });
    },
    [navigate]
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4">
      <Tabs onValueChange={handleTabChange} value={tab}>
        <ScrollArea>
          <TabsList className="max-w-full overflow-y-hidden" variant="line">
            {categories.map((c) => (
              <TabsTrigger key={c.to} value={c.to}>
                <c.icon /> {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="ui-prefs">UI preferences</TabsContent>
        <TabsContent value="ai-providers">
          <AiProviderSettings />
        </TabsContent>
        <TabsContent value="about">About Meant</TabsContent>
        <TabsContent value="updates">Updates and changelog</TabsContent>
      </Tabs>
    </main>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  validateSearch: settingsSearchSchema,
});
