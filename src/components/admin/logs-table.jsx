"use client";

import { useMemo, useState } from "react";
import { Search, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

const ACTION_VARIANTS = {
  create: "success",
  update: "default",
  delete: "warning",
  publish: "success",
  unpublish: "warning",
  login: "muted",
};

export function LogsTable({ logs = [] }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  const actions = useMemo(
    () => [...new Set(logs.map((log) => log.action))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (action !== "all" && log.action !== action) return false;
      if (!needle) return true;
      return [log.action, log.entity, log.admin_email, log.entity_id, JSON.stringify(log.metadata)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [logs, action, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search logs…"
            className="h-9 pl-9 text-[13px]"
            aria-label="Search activity logs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full text-[13px] sm:w-44"
            aria-label="Filter by action"
          >
            <option value="all">All actions</option>
            {actions.map((item) => (
              <option key={item} value={item}>
                {item.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <span className="whitespace-nowrap text-[11.5px] text-muted-foreground">
            {filtered.length} entries
          </span>
        </div>
      </div>

      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
              <History className="size-4" />
            </span>
            <p className="text-[14px] font-medium">No activity recorded yet</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-6 text-muted-foreground">
              Logins, content changes, publishes, uploads and administrator changes are recorded here
              automatically. Password and key values are never stored.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="hidden md:table-cell">Administrator</TableHead>
                <TableHead className="hidden lg:table-cell">Metadata</TableHead>
                <TableHead className="w-36 text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={ACTION_VARIANTS[log.action] ?? "outline"} className="capitalize">
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-[12.5px] font-medium">{log.entity?.replace(/_/g, " ") || "—"}</p>
                    {log.entity_id && (
                      <p className="max-w-[12rem] truncate font-mono text-[10.5px] text-muted-foreground">
                        {log.entity_id}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-[12px] text-muted-foreground md:table-cell">
                    {log.admin_email || "—"}
                  </TableCell>
                  <TableCell className="hidden max-w-[16rem] truncate font-mono text-[10.5px] text-muted-foreground lg:table-cell">
                    {log.metadata && Object.keys(log.metadata).length > 0
                      ? JSON.stringify(log.metadata)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-[11.5px] text-muted-foreground">
                    {formatDate(log.created_at, { month: "short" })}
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
            Page {currentPage} of {pageCount}
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
    </div>
  );
}
