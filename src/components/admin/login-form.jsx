"use client";

import { useActionState } from "react";
import { Loader2, LogIn, TerminalSquare } from "lucide-react";
import { signInAction, enterDemoAction } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const initialState = { error: null };

export function LoginForm({ demoMode = false }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  if (demoMode) {
    return (
      <form action={enterDemoAction} className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="flex items-center gap-2 text-[13px] font-medium">
            <TerminalSquare className="size-4 text-accent" /> Local demo mode
          </p>
          <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
            No Supabase connection is configured. You can explore the dashboard with sample content;
            saving changes is disabled until Supabase is connected. This mode never runs in
            production.
          </p>
        </div>
        <Button type="submit" className="w-full">
          Enter the demo dashboard
        </Button>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-[12.5px] text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
