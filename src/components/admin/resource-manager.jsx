"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
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
import { ResourceForm } from "@/components/admin/resource-form";
import {
  deleteResourceAction,
  moveResourceAction,
  togglePublishedAction,
} from "@/app/admin/actions/content";

const PAGE_SIZE = 8;

function primaryValue(row, resource) {
  if (row[resource.primary]) return row[resource.primary];
  const firstText = resource.fields.find((field) => field.type === "text");
  return firstText ? row[firstText.name] : row.id;
}

export function ResourceManager({ resourceKey, resource, rows = [] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const secondaryFields = useMemo(
    () =>
      resource.fields
        .filter(
          (field) =>
            !["gallery", "textarea", "switch", "image", "file"].includes(field.type) &&
            field.name !== resource.primary &&
            field.name !== "sort_order"
        )
        .slice(0, 2),
    [resource]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    let list = rows.filter((row) => {
      if (status === "published" && !row.is_published) return false;
      if (status === "draft" && row.is_published) return false;
      if (!needle) return true;
      return Object.values(row)
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    if (sortAsc) {
      list = list.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    } else {
      list = list.slice().sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));
    }

    return list;
  }, [rows, search, status, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setFormOpen(true);
  }

  function run(action, successFallback) {
    startTransition(async () => {
      const result = await action();
      if (result?.ok) {
        toast.success(result.message || successFallback);
        router.refresh();
      } else {
        toast.error(result?.message || "Action failed.");
      }
    });
  }

  if (resource.singleton) {
    const record = rows[0] ?? null;
    return (
      <div className="surface p-6">
        <ResourceForm
          resourceKey={resourceKey}
          resource={resource}
          record={record}
          onSaved={() => router.refresh()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="h-9 pl-9 text-[13px]"
              aria-label="Search records"
            />
          </div>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full text-[13px] sm:w-40"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </Select>
        </div>

        <Button onClick={openCreate} size="sm" className="shrink-0">
          <Plus className="size-3.5" /> New {resource.singular.toLowerCase()}
        </Button>
      </div>

      <div className="surface overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
              <Inbox className="size-4" />
            </span>
            <p className="text-[14px] font-medium">Nothing here yet</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-6 text-muted-foreground">
              {resource.description}
            </p>
            <Button onClick={openCreate} size="sm" variant="outline" className="mt-4">
              <Plus className="size-3.5" /> Add the first {resource.singular.toLowerCase()}
            </Button>
          </div>
        ) : paged.length === 0 ? (
          <div className="px-6 py-14 text-center text-[13px] text-muted-foreground">
            No records match your search or filter.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => setSortAsc((value) => !value)}
                    className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-foreground"
                  >
                    {resource.primary === "name" ? "Name" : "Title"}
                    {sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  </button>
                </TableHead>
                {secondaryFields.map((field) => (
                  <TableHead key={field.name} className="hidden md:table-cell">
                    {field.label}
                  </TableHead>
                ))}
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="max-w-xs truncate text-[13px] font-medium">
                      {primaryValue(row, resource)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Sort {row.sort_order ?? 0}
                    </p>
                  </TableCell>
                  {secondaryFields.map((field) => (
                    <TableCell key={field.name} className="hidden max-w-[14rem] truncate text-[12.5px] text-muted-foreground md:table-cell">
                      {Array.isArray(row[field.name])
                        ? row[field.name].join(", ")
                        : field.labels?.[row[field.name]] ?? row[field.name] ?? "—"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={row.is_published ? "success" : "warning"}>
                      {row.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          run(
                            () => moveResourceAction(resourceKey, row.id, "up"),
                            "Order updated."
                          )
                        }
                        disabled={pending}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          run(
                            () => moveResourceAction(resourceKey, row.id, "down"),
                            "Order updated."
                          )
                        }
                        disabled={pending}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          run(
                            () => togglePublishedAction(resourceKey, row.id, !row.is_published),
                            "Status updated."
                          )
                        }
                        disabled={pending}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                        aria-label={row.is_published ? "Unpublish" : "Publish"}
                      >
                        {row.is_published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
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

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <p>
            Page {currentPage} of {pageCount} · {filtered.length} records
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${resource.singular.toLowerCase()}` : `New ${resource.singular.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>{resource.description}</DialogDescription>
          </DialogHeader>
          <ResourceForm
            key={editing?.id ?? "new"}
            resourceKey={resourceKey}
            resource={resource}
            record={editing}
            onCancel={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget ? primaryValue(deleteTarget, resource) : ""}&rdquo; will be
              permanently removed, including any uploaded gallery images attached to it. This cannot
              be undone.
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
                run(() => deleteResourceAction(resourceKey, id), "Deleted.");
              }}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
