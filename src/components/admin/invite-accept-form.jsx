"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, MailCheck } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function InviteAcceptForm({ email, fullName }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    const supabase = getBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setPending(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || null } },
      });

      if (signUpError) {
        if (/already registered|already exists/i.test(signUpError.message)) {
          setError(
            "An account with this email already exists. Sign in instead - your invitation is applied automatically."
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (!data.session) {
        setEmailSent(true);
        return;
      }

      const { data: accepted } = await supabase.rpc("accept_pending_admin_invite");

      if (accepted === true) {
        toast.success("Administrator access activated.");
        router.push("/admin");
        router.refresh();
      } else {
        setError(
          "Your account was created but the invitation could not be applied. Make sure you used the invited email address, then sign in."
        );
      }
    } catch (signUpError) {
      setError(signUpError.message || "Could not create the account.");
    } finally {
      setPending(false);
    }
  }

  if (emailSent) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-700 dark:text-emerald-400">
          <MailCheck className="size-4" /> Confirm your email address
        </p>
        <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>. After
          confirming, sign in at the admin login page - your administrator access activates
          automatically.
        </p>
        <Button className="mt-4 w-full" onClick={() => router.push("/admin/login")}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" value={email} readOnly disabled />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="invite-password">Create a password</Label>
        <Input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="invite-confirm">Confirm password</Label>
        <Input
          id="invite-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-[12.5px] leading-5 text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        {pending ? "Creating account…" : "Create admin account"}
      </Button>
    </form>
  );
}
