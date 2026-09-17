import { CheckIcon, RefreshCcw, Save, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteProviderKey,
  getProvidersSettings,
  setProviderKey,
} from "@/actions/ai-providers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ConfiguredProvider } from "@/ipc/ai-providers/schemas";
import type { AiProviderId } from "@/types/ai-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";

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
  {
    code: "openrouter",
    name: "Open Router",
  },
  {
    code: "google",
    name: "Google",
  },
  {
    code: "ollama",
    name: "Ollama",
  },
  {
    code: "lmstudio",
    name: "LLM Studio",
  },
];

export function AiProviderSettings() {
  const [configuredProviders, setConfiguredProviders] = useState<
    ConfiguredProvider[]
  >([]);
  const [, startListConfiguredProviders] = useTransition();

  const refresh = useCallback(() => {
    startListConfiguredProviders(() =>
      getProvidersSettings().then(setConfiguredProviders)
    );
  }, []);

  useEffect(() => refresh(), [refresh]);

  return (
    <FieldSet>
      <FieldLegend>AI Providers</FieldLegend>
      <FieldDescription>
        <p>
          Your API keys stay on your device, encrypted at rest, and are only
          decrypted when required.
        </p>
        <p>
          Keys are stored locally in your app data folder and are never sent to
          our servers. [View key storage]
        </p>
      </FieldDescription>
      <FieldGroup>
        <Accordion className="max-w-2xl" type="multiple">
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
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleSave = useCallback(() => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      return;
    }
    startSave(async () => {
      await setProviderKey({ apiKey: trimmed, providerId: provider.code });
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
      <AccordionContent>
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
      </AccordionContent>
    </AccordionItem>
  );
}
