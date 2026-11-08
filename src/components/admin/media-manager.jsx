"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  Trash2,
  Copy,
  Check,
  Search,
  FileText,
  Images,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { deleteMediaAction } from "@/app/admin/actions/media";
import { formatDate } from "@/lib/utils";

function isImage(asset) {
  return (asset.mime_type || "").startsWith("image/");
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("URL copied.");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Copy failed - open the file and copy the address instead.");
        }
      }}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Copy URL"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function MediaManager({ assets = [] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bucket, setBucket] = useState(STORAGE_BUCKETS.images);
  const [uploading, setUploading] = useState(false);
  const [filterBucket, setFilterBucket] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (filterBucket !== "all" && asset.bucket !== filterBucket) return false;
      if (!needle) return true;
      return [asset.file_name, asset.path, asset.bucket]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [assets, filterBucket, search]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("bucket", bucket);
        body.append("folder", bucket === STORAGE_BUCKETS.privateDocuments ? "private" : "library");

        const response = await fetch("/api/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    event.target.value = "";
    toast.success("Upload finished.");
    router.refresh();
  }

  function handleDelete() {
    const id = deleteTarget?.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteMediaAction(id);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="surface p-5">
        <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
          <Upload className="size-4 text-accent" /> Upload files
        </h3>
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
          Images: JPG, PNG, WebP, GIF up to 5 MB. Documents: PDF or image up to 10 MB.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select
            value={bucket}
            onChange={(event) => setBucket(event.target.value)}
            className="h-9 text-[12.5px] sm:w-64"
            aria-label="Storage bucket"
          >
            <option value={STORAGE_BUCKETS.images}>portfolio-images (public)</option>
            <option value={STORAGE_BUCKETS.documents}>portfolio-documents (public)</option>
            <option value={STORAGE_BUCKETS.privateDocuments}>private-documents (admins only)</option>
          </Select>

          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground">
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {uploading ? "Uploading…" : "Choose files"}
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              accept={
                bucket === STORAGE_BUCKETS.images
                  ? "image/jpeg,image/png,image/webp,image/gif"
                  : "application/pdf,image/jpeg,image/png,image/webp"
              }
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files…"
            className="h-9 pl-9 text-[13px]"
            aria-label="Search files"
          />
        </div>
        <Select
          value={filterBucket}
          onChange={(event) => setFilterBucket(event.target.value)}
          className="h-9 w-full text-[13px] sm:w-56"
          aria-label="Filter by bucket"
        >
          <option value="all">All buckets ({assets.length})</option>
          {Object.values(STORAGE_BUCKETS).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
          <Images className="mb-3 size-5 text-muted-foreground" />
          <p className="text-[14px] font-medium">No files here yet</p>
          <p className="mt-1 max-w-sm text-[12.5px] leading-6 text-muted-foreground">
            Files uploaded from the content forms or here appear in this library.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <li key={asset.id} className="surface overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted">
                {isImage(asset) && asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.file_name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="size-6" strokeWidth={1.5} />
                    <span className="text-[10.5px] uppercase tracking-[0.12em]">
                      {asset.mime_type || "file"}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[12.5px] font-medium">{asset.file_name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDate(asset.created_at, { month: "short" })}
                  {asset.size_bytes ? ` · ${(asset.size_bytes / 1024).toFixed(0)} KB` : ""}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {asset.bucket}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <CopyButton value={asset.url} />
                    {asset.url && (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Open file"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asset)}
                      disabled={pending}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete file"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this file?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleteTarget?.file_name}&rdquo; will be removed from storage. Any content still
              referencing it will show a broken link, so update those items first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
