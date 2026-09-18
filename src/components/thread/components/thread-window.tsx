import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Thread, ThreadMessage } from "@/ipc/agents/schema";
import { formatRelativeTime } from "@/utils/formaters";
import { LocalInfos } from "./local-info";
import { ThreadDisplay } from "./thread-display";
import { ThreadInput } from "./thread-input";

interface ThreadWindowProps {
  isBusy: boolean;
  messages: ThreadMessage[];
  onSubmit: (input: string) => Promise<void>;
  thread: Thread;
}

export function ThreadWindow({
  thread,
  messages,
  isBusy,
  onSubmit,
}: ThreadWindowProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col gap-4">
      <Card className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col gap-0">
        <CardHeader className="gap-1 border-b">
          <CardTitle>{thread.title}</CardTitle>
          <CardDescription>
            {formatRelativeTime(thread.updatedAt)}
          </CardDescription>
          <CardAction>
            <LocalInfos thread={thread} />
          </CardAction>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
          <ThreadDisplay isBusy={isBusy} messages={messages} />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <ThreadInput isBusy={isBusy} onSubmit={onSubmit} />
        </CardFooter>
      </Card>
    </div>
  );
}
