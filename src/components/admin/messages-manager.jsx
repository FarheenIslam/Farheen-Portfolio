"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Inbox,
  Search,
  Mail,
  MailOpen,
  Archive,
  ArchiveRestore,
  Trash2,
  Reply,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn, formatDate } from "@/lib/utils";
import {
  deleteMessageAction,
  setMessageFlagsAction,
} from "@/app/admin/actions/messages";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
];

export function MessagesManager({ messages = [] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return messages.filter((message) => {
      if (filter === "unread" && (message.is_read || message.is_archived)) return false;
      if (filter === "archived" && !message.is_archived) return false;
      if (filter === "all" && message.is_archived) return false;
      if (!needle) return true;
      return [message.name, message.email, message.subject, message.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [messages, filter, search]);

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

  const unreadCount = messages.filter((message) => !message.is_read && !message.is_archived).length;

  function openMessage(message) {
    setActive(message);
    if (!message.is_read) {
      run(() => setMessageFlagsAction(message.id, { is_read: true }), "Marked as read.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                filter === item.key
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-accent/20 px-1.5 text-[10px] text-accent">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages…"
            className="h-9 pl-9 text-[13px]"
            aria-label="Search messages"
          />
        </div>
      </div>

      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
              <Inbox className="size-4" />
            </span>
            <p className="text-[14px] font-medium">No messages here</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-6 text-muted-foreground">
              Messages sent through the public contact form arrive here. They are private and only
              visible to administrators.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-6" />
                <TableHead>From</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="w-32">Received</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((message) => (
                <TableRow
                  key={message.id}
                  className={cn("cursor-pointer", !message.is_read && "bg-accent/[0.03]")}
                  onClick={() => openMessage(message)}
                >
                  <TableCell>
                    {message.is_read ? (
                      <MailOpen className="size-3.5 text-muted-foreground" />
                    ) : (
                      <span className="inline-flex size-2 rounded-full bg-accent" />
                    )}
                  </TableCell>
                  <TableCell>
                    <p className={cn("text-[13px]", !message.is_read && "font-semibold")}>
                      {message.name}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">{message.email}</p>
                  </TableCell>
                  <TableCell className="hidden max-w-[18rem] truncate text-[12.5px] text-muted-foreground md:table-cell">
                    {message.subject || message.message.slice(0, 80)}
                  </TableCell>
                  <TableCell className="text-[11.5px] text-muted-foreground">
                    {formatDate(message.created_at, { month: "short" })}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              setMessageFlagsAction(message.id, {
                                is_read: !message.is_read,
                              }),
                            "Updated."
                          )
                        }
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={message.is_read ? "Mark unread" : "Mark read"}
                      >
                        {message.is_read ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              setMessageFlagsAction(message.id, {
                                is_archived: !message.is_archived,
                                is_read: true,
                              }),
                            "Updated."
                          )
                        }
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={message.is_archived ? "Restore" : "Archive"}
                      >
                        {message.is_archived ? (
                          <ArchiveRestore className="size-3.5" />
                        ) : (
                          <Archive className="size-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setDeleteTarget(message)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete message"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.subject || "Contact message"}</DialogTitle>
                <DialogDescription>
                  From {active.name} · {active.email}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <Clock className="size-3.5" />
                {formatDate(active.created_at)}
                {active.is_archived && <Badge variant="muted">Archived</Badge>}
              </div>

              <div className="mt-4 whitespace-pre-line rounded-xl border border-border bg-muted/30 p-4 text-[13.5px] leading-7">
                {active.message}
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteTarget(active)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActive(null)}>
                    Close
                  </Button>
                  <a
                    href={`mailto:${active.email}?subject=${encodeURIComponent(
                      `Re: ${active.subject || "Your message"}`
                    )}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Reply className="size-4" /> Reply by email
                  </a>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this message?</DialogTitle>
            <DialogDescription>
              The message from {deleteTarget?.name} will be permanently removed. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                const id = deleteTarget?.id;
                setDeleteTarget(null);
                setActive(null);
                run(() => deleteMessageAction(id), "Message deleted.");
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
