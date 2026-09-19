import {
  AlertCircleIcon,
  CheckIcon,
  RefreshCcw,
  Save,
  TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteProviderKey,
  getProvidersSettings,
  trySettingProviderKey,
} from "@/actions/ai-providers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ConfiguredProvider } from "@/ipc/ai-providers/schemas";
import { useModelStore } from "@/stores/model-store";
import type { AiProviderId } from "@/types/ai-provider";
import { cn } from "@/utils/tailwind";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

const providers: {
  code: AiProviderId;
  name: string;
}[] = [
  {
    code: "anthropic",
    name: "Anthropic",
  },
  {
    code: "openai",
    name: "Open AI",
  },
];

export function AiProviderSettings() {
  const [configuredProviders, setConfiguredProviders] = useState<
    ConfiguredProvider[]
  >([]);
  const llms = useModelStore((s) => s.llms);
  const refreshModels = useModelStore((s) => s.load);
  const [, startListConfiguredProviders] = useTransition();

  const refresh = useCallback(() => {
    startListConfiguredProviders(() => {
      getProvidersSettings().then(setConfiguredProviders);
    });
    refreshModels();
  }, [refreshModels]);

  useEffect(() => refresh(), [refresh]);

  return (
    <div className="space-y-4">
      <FieldSet>
        <FieldLegend>AI Providers</FieldLegend>
        <FieldDescription>
          <p>
            Your API keys stay on your device, encrypted at rest, and are only
            decrypted when required.
          </p>
          <p>
            Keys are stored locally in your app data folder and are never sent
            to our servers. [View key storage]
          </p>
        </FieldDescription>
        <FieldGroup>
          <Accordion type="multiple">
            {providers.map((provider) => {
              const key = configuredProviders.find(
                (c) => c.providerId === provider.code
              )?.apiKey;
              const isSet = !!key;
              return (
                <ProviderKeyItem
                  isSet={isSet}
                  key={provider.code}
                  maskedKey={key}
                  onChange={refresh}
                  provider={provider}
                />
              );
            })}
          </Accordion>
        </FieldGroup>
      </FieldSet>
      <Separator className="w-full" orientation="horizontal" />
      <FieldSet>
        <FieldLegend>AI Models</FieldLegend>
        <FieldDescription>
          <p>
            Your API keys stay on your device, encrypted at rest, and are only
            decrypted when required.
          </p>
          <p>
            Keys are stored locally in your app data folder and are never sent
            to our servers. [View key storage]
          </p>
        </FieldDescription>
        <FieldGroup>
          {llms.map((m) => (
            <Card key={m.modelId}>
              <CardHeader>
                <CardTitle>
                  {m.providerId} - {m.displayName}
                </CardTitle>
                <CardDescription>{m.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </FieldGroup>
      </FieldSet>
    </div>
  );
}

function ProviderKeyItem({
  provider,
  isSet,
  maskedKey,
  onChange,
}: {
  provider: { code: AiProviderId; name: string };
  isSet: boolean;
  maskedKey: string | null | undefined;
  onChange: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleSave = useCallback(() => {
    setSaveError(null);
    const trimmed = apiKey.trim();
    if (!trimmed) {
      return;
    }
    startSave(async () => {
      const { error } = await trySettingProviderKey({
        apiKey: trimmed,
        providerId: provider.code,
      });
      if (error) {
        setSaveError(error);
        setApiKey("");
        return;
      }
      setApiKey("");
      onChange();
    });
  }, [apiKey, provider.code, onChange]);

  const handleDelete = useCallback(() => {
    startDelete(async () => {
      await deleteProviderKey(provider.code);
      onChange();
    });
  }, [provider.code, onChange]);

  const deleteDisabled = !isSet || isDeleting;
  const canSave = apiKey.trim().length > 0 && !isSaving;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value),
    []
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && canSave) {
        handleSave();
      }
    },
    [canSave, handleSave]
  );

  return (
    <AccordionItem value={provider.code}>
      <AccordionTrigger>
        {provider.name}{" "}
        {isSet ? (
          <Badge variant="secondary">
            <CheckIcon /> Configured
          </Badge>
        ) : (
          <Badge variant="destructive">Not configured</Badge>
        )}
      </AccordionTrigger>
      <AccordionContent className={cn("h-auto")}>
        <div className="flex flex-row items-center gap-2">
          <Input
            aria-label={`${provider.name} API key`}
            className="flex-1"
            disabled={isSaving}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={isSet ? (maskedKey ?? undefined) : "Not set"}
            type="password"
            value={apiKey}
          />
          <Button disabled={!canSave} onClick={handleSave} type="button">
            {isSet ? <RefreshCcw /> : <Save />}
            {isSet ? "Replace" : "Save"}
          </Button>

          <Button
            aria-label={`Remove ${provider.name} key`}
            disabled={deleteDisabled}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            <TrashIcon /> Delete key
          </Button>
        </div>
        {/** biome-ignore lint/suspicious/noLeakedRender: <explanation> */}
        {saveError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
              New key has <span className="font-bold">NOT</span> been saved{" "}
            </AlertTitle>{" "}
            <AlertDescription>
              <p>{saveError}</p>
            </AlertDescription>
          </Alert>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
