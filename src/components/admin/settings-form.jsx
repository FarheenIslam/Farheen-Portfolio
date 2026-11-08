"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function SettingsForm({ settings }) {
  const router = useRouter();
  const [values, setValues] = useState({
    site_title: settings.site_title ?? "",
    site_tagline: settings.site_tagline ?? "",
    seo_description: settings.seo_description ?? "",
    contact_intro: settings.contact_intro ?? "",
    footer_note: settings.footer_note ?? "",
    show_design_gallery: settings.show_design_gallery !== false,
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.set(key, String(value)));

      const result = await saveSettingsAction(null, formData);

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="site_title">Site title</Label>
          <Input
            id="site_title"
            value={values.site_title}
            onChange={(event) => set("site_title", event.target.value)}
            required
          />
          <p className="text-[11.5px] text-muted-foreground">Used in browser tabs and metadata.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="site_tagline">Tagline</Label>
          <Input
            id="site_tagline"
            value={values.site_tagline}
            onChange={(event) => set("site_tagline", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seo_description">SEO description</Label>
        <Textarea
          id="seo_description"
          rows={3}
          value={values.seo_description}
          onChange={(event) => set("seo_description", event.target.value)}
          maxLength={400}
        />
        <p className="text-[11.5px] text-muted-foreground">
          {values.seo_description.length}/400 characters · shown in search results and social
          previews.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_intro">Contact page introduction</Label>
        <Textarea
          id="contact_intro"
          rows={3}
          value={values.contact_intro}
          onChange={(event) => set("contact_intro", event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="footer_note">Footer note</Label>
        <Input
          id="footer_note"
          value={values.footer_note}
          onChange={(event) => set("footer_note", event.target.value)}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-[13px] font-medium">Show the design gallery on the home page</p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            The dedicated /designs page stays available either way.
          </p>
        </div>
        <Switch
          checked={values.show_design_gallery}
          onCheckedChange={(checked) => set("show_design_gallery", checked)}
          aria-label="Show design gallery"
        />
      </div>

      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-[12.5px] text-destructive">
          {message}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
