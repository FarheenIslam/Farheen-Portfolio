"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, X, ChevronUp, ChevronDown, Plus, ImagePlus, FileText } from "lucide-react";
import { saveResourceAction } from "@/app/admin/actions/content";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

function fieldBucket(field) {
  return field.type === "image" ? STORAGE_BUCKETS.images : STORAGE_BUCKETS.documents;
}

function buildInitialValues(resource, record) {
  const values = {};
  for (const field of resource.fields) {
    if (field.type === "gallery") continue;
    const raw = record?.[field.name];

    if (field.type === "switch") {
      values[field.name] = raw ?? field.defaultValue ?? false;
    } else if (field.type === "tags") {
      values[field.name] = Array.isArray(raw) ? raw.join(", ") : raw ?? "";
    } else {
      values[field.name] = raw ?? field.defaultValue ?? "";
    }
  }
  return values;
}

function initialGallery(resource, record) {
  const rows = record?.[resource.gallery?.table] ?? [];
  return rows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row) => ({ url: row.url, caption: row.caption ?? "" }));
}

function UploadField({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("bucket", fieldBucket(field));
      body.append("folder", field.folder || "general");

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      toast.success("File uploaded.");
    } catch (uploadError) {
      setError(uploadError.message);
      toast.error(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const isImage = field.type === "image";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          name={field.name}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={isImage ? "https://… image URL" : "https://… file URL"}
        />
        <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] font-medium hover:bg-muted">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            className="hidden"
            accept={isImage ? "image/jpeg,image/png,image/webp,image/gif" : "application/pdf,image/jpeg,image/png,image/webp"}
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
            aria-label="Remove file"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {isImage && value && (
        <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {!isImage && value && (
        <p className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <FileText className="size-3.5" /> File attached
        </p>
      )}
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}

function GalleryField({ items, onChange, folder }) {
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  function update(index, patch) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function remove(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  async function handleFiles(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    const uploaded = [];

    for (const file of files) {
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("bucket", STORAGE_BUCKETS.images);
        body.append("folder", folder || "gallery");
        const response = await fetch("/api/upload", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({ url: data.url, caption: "" });
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`);
      }
    }

    if (uploaded.length > 0) {
      onChange([...items, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} added.`);
    }

    setUploading(false);
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${item.url}-${index}`} className="flex items-start gap-3 rounded-lg border border-border p-2.5">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Input
                  value={item.url}
                  onChange={(event) => update(index, { url: event.target.value })}
                  className="h-8 text-[12px]"
                  placeholder="Image URL"
                />
                <Input
                  value={item.caption ?? ""}
                  onChange={(event) => update(index, { caption: event.target.value })}
                  className="h-8 text-[12px]"
                  placeholder="Caption (optional)"
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ChevronDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-[12.5px] font-medium hover:bg-muted">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          {uploading ? "Uploading…" : "Upload images"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>

        <div className="flex flex-1 gap-2">
          <Input
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="…or paste an image URL"
            className="h-9 text-[12.5px]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              if (!urlDraft.trim()) return;
              onChange([...items, { url: urlDraft.trim(), caption: "" }]);
              setUrlDraft("");
            }}
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ResourceForm({ resourceKey, resource, record, onSaved, onCancel }) {
  const router = useRouter();
  const [values, setValues] = useState(() => buildInitialValues(resource, record));
  const [gallery, setGallery] = useState(() => initialGallery(resource, record));
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const galleryField = useMemo(
    () => resource.fields.find((field) => field.type === "gallery"),
    [resource.fields]
  );

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormMessage(null);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("__resource", resourceKey);
      if (record?.id) formData.set("id", record.id);
      if (galleryField) {
        formData.set("gallery", JSON.stringify(gallery.filter((item) => item.url?.trim())));
      }

      const result = await saveResourceAction(null, formData);

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
        onSaved?.(result);
      } else {
        setErrors(result.errors ?? {});
        setFormMessage(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setFormMessage(error.message);
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {resource.fields
          .filter((field) => field.type !== "gallery")
          .map((field) => {
            const fullWidth = ["textarea", "image", "file"].includes(field.type);
            return (
              <div
                key={field.name}
                className={fullWidth ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
              >
                {field.type === "switch" ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                    <div>
                      <p className="text-[13px] font-medium">{field.label}</p>
                      {field.help && (
                        <p className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">
                          {field.help}
                        </p>
                      )}
                    </div>
                    <input
                      type="hidden"
                      name={field.name}
                      value={values[field.name] ? "true" : "false"}
                    />
                    <Switch
                      checked={Boolean(values[field.name])}
                      onCheckedChange={(checked) => setValue(field.name, checked)}
                      aria-label={field.label}
                    />
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`field-${field.name}`}>
                      {field.label}
                      {field.required && <span className="ml-0.5 text-destructive">*</span>}
                    </Label>

                    {field.type === "textarea" && (
                      <Textarea
                        id={`field-${field.name}`}
                        name={field.name}
                        rows={field.rows ?? 4}
                        value={values[field.name] ?? ""}
                        onChange={(event) => setValue(field.name, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.type === "select" && (
                      <Select
                        id={`field-${field.name}`}
                        name={field.name}
                        value={values[field.name] ?? ""}
                        onChange={(event) => setValue(field.name, event.target.value)}
                      >
                        {(field.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {field.labels?.[option] ?? option ?? "Not specified"}
                          </option>
                        ))}
                      </Select>
                    )}

                    {["text", "email", "url", "number", "date", "tags"].includes(field.type) && (
                      <Input
                        id={`field-${field.name}`}
                        name={field.name}
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "date"
                              ? "date"
                              : field.type === "email"
                                ? "email"
                                : "text"
                        }
                        value={values[field.name] ?? ""}
                        onChange={(event) => setValue(field.name, event.target.value)}
                        placeholder={
                          field.placeholder ?? (field.type === "tags" ? "Comma separated" : undefined)
                        }
                      />
                    )}

                    {["image", "file"].includes(field.type) && (
                      <UploadField
                        field={field}
                        value={values[field.name] ?? ""}
                        onChange={(value) => setValue(field.name, value)}
                      />
                    )}

                    {field.help && field.type !== "switch" && (
                      <p className="text-[11.5px] leading-5 text-muted-foreground">{field.help}</p>
                    )}
                  </>
                )}

                {errors[field.name] && (
                  <p className="text-[12px] text-destructive">{errors[field.name]}</p>
                )}
              </div>
            );
          })}
      </div>

      {galleryField && (
        <div className="space-y-1.5 border-t border-border pt-4">
          <Label>{galleryField.label}</Label>
          {galleryField.help && (
            <p className="text-[11.5px] leading-5 text-muted-foreground">{galleryField.help}</p>
          )}
          <GalleryField
            items={gallery}
            onChange={setGallery}
            folder={galleryField.folder || resourceKey}
          />
        </div>
      )}

      {formMessage && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-[12.5px] text-destructive">
          {formMessage}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {record ? "Save changes" : `Create ${resource.singular.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
