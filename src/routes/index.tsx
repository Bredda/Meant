import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useTransition } from "react";
import { hasAnyProvider } from "@/actions/ai-providers";
import { RequiredAiProviderPanel } from "@/components/ai-provider-required";

/*
 * Update this page to modify your home page.
 * You can delete this file component to start from a blank page.
 */

function HomePage() {
  const [hasProvider, setHasProvider] = useState(false);
  const [, startCheckProviders] = useTransition();

  useEffect(
    () => startCheckProviders(() => hasAnyProvider().then(setHasProvider)),
    []
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4">
      {!hasProvider && <RequiredAiProviderPanel />}
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
