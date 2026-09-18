import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  PaperclipIcon,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/utils/tailwind";

interface ThreadInputProps {
  className?: string;
  isBusy: boolean;
  onSubmit: (input: string) => void;
}
export function ThreadInput({ isBusy, onSubmit, className }: ThreadInputProps) {
  const [input, setInput] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSend = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      const trimmed = input.trim();
      if (!trimmed || isBusy) {
        return;
      }

      onSubmit(trimmed);
      setInput("");
    },
    [input, isBusy, onSubmit]
  );

  return (
    <form className={cn("w-full", className)} onSubmit={handleSend}>
      <InputGroup>
        <InputGroupInput onChange={handleInputChange} value={input} />
        <InputGroupAddon align="block-end" className="pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <InputGroupButton
                aria-label="Add files"
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <PlusIcon />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44" side="top">
              <DropdownMenuItem>
                <PaperclipIcon />
                Add Photos & Files
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ImageIcon />
                Create Image
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TelescopeIcon />
                Deep Research
              </DropdownMenuItem>
              <DropdownMenuItem>
                <GlobeIcon />
                Web Search
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <InputGroupButton
            className="ml-auto"
            disabled={!input || isBusy}
            size="icon-sm"
            type="submit"
            variant="default"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
