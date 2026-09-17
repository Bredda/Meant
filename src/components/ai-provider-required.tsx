import { Link } from "@tanstack/react-router";
import { AlertTriangle, Settings } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "./ui/button";

export function RequiredAiProviderPanel() {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="uppercase">
          Required next step
        </CardDescription>
        <CardTitle className="flex items-center gap-2 text-primary">
          <AlertTriangle />
          <span> Configure AI Providers</span>
        </CardTitle>
        <CardAction>
          <Link
            className={buttonVariants({ variant: "default" })}
            search={{ tab: "ai-providers" }}
            to="/settings"
          >
            <Settings />
            Setup AI providers
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>You nedd to setup at least one AI provider before ...</p>
      </CardContent>
    </Card>
  );
}
