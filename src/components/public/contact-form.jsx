"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitContactMessage } from "@/app/actions/contact";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { status: "idle", message: "", errors: null };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    }
    if (state.status === "error" && !state.errors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            placeholder="Your full name"
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          {state.errors?.name && (
            <p id="name-error" className="text-[12px] text-destructive">
              {state.errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={Boolean(state.errors?.email)}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" className="text-[12px] text-destructive">
              {state.errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject (optional)</Label>
        <Input id="subject" name="subject" placeholder="Research collaboration, opportunity…" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Tell me what you have in mind."
          aria-invalid={Boolean(state.errors?.message)}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
        />
        {state.errors?.message && (
          <p id="message-error" className="text-[12px] text-destructive">
            {state.errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {pending ? "Sending…" : "Send message"}
        </Button>
        <p className="text-[12px] text-muted-foreground">
          Your message is stored securely and never shared publicly.
        </p>
      </div>

      {state.status === "success" && (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-emerald-600/10 p-3 text-[13px] text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-[13px] text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.message}
        </p>
      )}
    </form>
  );
}
