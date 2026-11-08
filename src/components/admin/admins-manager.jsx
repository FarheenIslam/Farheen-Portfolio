"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlus,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Loader2,
  Clock,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  inviteAdminAction,
  removeAdminAction,
  revokeInviteAction,
  setAdminActiveAction,
} from "@/app/admin/actions/admins";

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Link copied.");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Could not copy. Select the link and copy it manually.");
        }
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function AdminsManager({ admins = [], invites = [], currentAdminId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [origin, setOrigin] = useState("");

  // The origin is only known in the browser - avoids an SSR/client mismatch.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function run(action, successMessage) {
    startTransition(async () => {
      const result = await action();
      if (result?.ok) {
        toast.success(result.message || successMessage);
        router.refresh();
      } else {
        toast.error(result?.message || "Action failed.");
      }
    });
  }

  function handleInvite(event) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("full_name", fullName);

      const result = await inviteAdminAction(null, formData);

      if (result.ok && result.invite) {
        const link = `${window.location.origin}/admin/invite/${result.invite.token}`;
        setInviteLink({ url: link, email: result.invite.email });
        setEmail("");
        setFullName("");
        toast.success(result.message);
        router.refresh();
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="surface p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold">
            <UserPlus className="size-4 text-accent" /> Invite an administrator
          </h3>
          <p className="mt-1 text-[12.5px] leading-6 text-muted-foreground">
            The invitation link is tied to the email address. The invitee creates a password with
            Supabase Auth, and admin access is granted only when their verified email matches a
            pending invitation.
          </p>

          <form onSubmit={handleInvite} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Full name (optional)</Label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Name shown in activity logs"
              />
            </div>
            {error && <p className="text-[12px] text-destructive">{error}</p>}
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
              Create invitation
            </Button>
          </form>

          {inviteLink && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
              <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
                Send this link to {inviteLink.email}
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input readOnly value={inviteLink.url} className="h-9 text-[12px]" />
                <CopyButton value={inviteLink.url} />
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                The link expires in 7 days. After the invitee sets a password and confirms their
                email, admin access activates automatically at sign-in.
              </p>
            </div>
          )}
        </div>

        <div className="surface p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold">
            <ShieldCheck className="size-4 text-accent" /> Equal-permission model
          </h3>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-6 text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              Every active administrator can create, edit, publish, delete and invite - there is no
              super admin.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              Authorisation is checked on the server for every page and action, and enforced again by
              Row Level Security in PostgreSQL.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              The database refuses to delete or deactivate the last active administrator.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              The Supabase service-role key is never used or exposed in the app.
            </li>
          </ul>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-[13.5px] font-semibold">Administrators ({admins.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Name</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="hidden lg:table-cell w-32">Added</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <p className="text-[13px] font-medium">{row.email}</p>
                  {row.id === currentAdminId && (
                    <p className="text-[11px] text-muted-foreground">You</p>
                  )}
                </TableCell>
                <TableCell className="hidden text-[12.5px] text-muted-foreground md:table-cell">
                  {row.full_name || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={row.is_active ? "success" : "warning"}>
                    {row.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-[11.5px] text-muted-foreground lg:table-cell">
                  {formatDate(row.created_at, { month: "short" })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={pending || (row.id === currentAdminId && row.is_active)}
                      onClick={() =>
                        run(
                          () => setAdminActiveAction(row.id, !row.is_active),
                          "Administrator updated."
                        )
                      }
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                      aria-label={row.is_active ? "Deactivate" : "Reactivate"}
                      title={row.is_active ? "Deactivate" : "Reactivate"}
                    >
                      {row.is_active ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={pending || row.id === currentAdminId}
                      onClick={() => setRemoveTarget(row)}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                      aria-label="Remove administrator"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="surface overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Clock className="size-4 text-muted-foreground" /> Pending invitations ({invites.length})
          </h3>
        </div>

        {invites.length === 0 ? (
          <p className="px-5 py-8 text-center text-[12.5px] text-muted-foreground">
            No pending invitations.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((invite) => {
              const expired = new Date(invite.expires_at) < new Date();
              const link = `${origin}/admin/invite/${invite.token}`;
              return (
                <li key={invite.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{invite.email}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {expired ? "Expired" : "Expires"} {formatDate(invite.expires_at, { month: "short" })}
                      {invite.full_name ? ` · ${invite.full_name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton value={link} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => run(() => revokeInviteAction(invite.id), "Invitation revoked.")}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Revoke
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-[12px] leading-6 text-muted-foreground">
        <Link2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
        <p>
          If an invitation expires, create a new one. Existing administrators can always invite new
          administrators - no email service is required, you simply share the generated link.
        </p>
      </div>

      <Dialog open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove this administrator?</DialogTitle>
            <DialogDescription>
              {removeTarget?.email} will immediately lose access to the dashboard. Their Supabase Auth
              user still exists and can be deleted from the Supabase dashboard if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-[12px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            The last active administrator can never be removed.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                const id = removeTarget?.id;
                setRemoveTarget(null);
                run(() => removeAdminAction(id), "Administrator removed.");
              }}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
