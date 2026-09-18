import { useCallback, useMemo } from "react";
import { getDefaultModel } from "@/actions/ai-providers";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useThreadsStore } from "@/stores/threads-store";
import { mergeStreamingMessages } from "../utils";
import { ThreadDisplay } from "./thread-display";
import { ThreadInput } from "./thread-input";

interface ThreadSheetProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ThreadSheet({ open, onOpenChange }: ThreadSheetProps) {
  const threadId = useMemo(() => crypto.randomUUID(), []);
  const persistedMessages = useThreadsStore((s) => s.messages[threadId]);
  const streaming = useThreadsStore((s) => s.streaming[threadId]);
  const sendMessage = useThreadsStore((s) => s.sendMessage);

  const isBusy = !!streaming && !streaming.error;

  const messages = useMemo(
    () => mergeStreamingMessages(threadId, persistedMessages ?? [], streaming),
    [threadId, persistedMessages, streaming]
  );

  const handleSubmit = useCallback(
    async (input: string) => {
      const model = await getDefaultModel();
      await sendMessage({ input, model, threadId, tools: [] });
    },
    [sendMessage, threadId]
  );

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New conversation</SheetTitle>
          <SheetDescription>
            Messages in this thread are saved locally.
          </SheetDescription>
        </SheetHeader>
        <ThreadDisplay isBusy={isBusy} messages={messages} />
        {streaming?.error ? (
          <p className="px-4 text-destructive text-xs">{streaming.error}</p>
        ) : null}
        <SheetFooter>
          <ThreadInput isBusy={isBusy} onSubmit={handleSubmit} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
