"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  ExternalLink,
  FileText,
  Images,
  Building2,
  Eye,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "@/components/public/filter-bar";
import { EmptyState } from "@/components/public/section";
import { SmartImage } from "@/components/smart-image";
import { formatDate } from "@/lib/utils";

export const CERTIFICATE_CATEGORIES = [
  "Academic Certificates",
  "Online Course Certificates",
  "Workshop Certificates",
  "Training Certificates",
  "Competition Certificates",
  "Participation Certificates",
  "Research Certificates",
  "Other Achievements",
];

const isPdf = (url = "") => /\.pdf(\?|#|$)/i.test(url);

export function CertificateGallery({ certificates = [] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return certificates.filter((certificate) => {
      const inCategory = category === "All" || certificate.category === category;
      const inQuery =
        !needle ||
        [certificate.title, certificate.issuer, certificate.category, certificate.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return inCategory && inQuery;
    });
  }, [certificates, category, query]);

  return (
    <div>
      <FilterBar
        categories={CERTIFICATE_CATEGORIES}
        active={category}
        onChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search certificates…"
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates to show yet"
          description={
            certificates.length === 0
              ? "Certificates uploaded from the admin dashboard appear here, filterable by category and searchable by name."
              : "Try a different category or search term."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((certificate) => (
            <article key={certificate.id} className="group surface flex flex-col overflow-hidden">
              <button
                type="button"
                onClick={() => setActive(certificate)}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left"
                aria-label={`Preview ${certificate.title}`}
              >
                {certificate.file_url && !isPdf(certificate.file_url) ? (
                  <SmartImage
                    src={certificate.file_url}
                    alt={certificate.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    {certificate.file_url ? (
                      <FileText className="size-7" strokeWidth={1.5} />
                    ) : (
                      <Award className="size-7" strokeWidth={1.5} />
                    )}
                    <span className="text-[11px] uppercase tracking-[0.14em]">
                      {certificate.file_url ? "PDF certificate" : "No file uploaded"}
                    </span>
                  </div>
                )}
                <span className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
                  <Eye className="size-3.5" />
                </span>
              </button>

              <div className="flex flex-1 flex-col p-5">
                {certificate.category && (
                  <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
                    {certificate.category}
                  </p>
                )}
                <h3 className="mt-1 text-[15px] font-semibold leading-snug">{certificate.title}</h3>
                {certificate.issuer && (
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Building2 className="size-3.5" /> {certificate.issuer}
                  </p>
                )}
                {certificate.issue_date && (
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatDate(certificate.issue_date)}
                  </p>
                )}
                {certificate.description && (
                  <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-muted-foreground">
                    {certificate.description}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setActive(certificate)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Eye className="size-3.5" /> Preview
                  </button>
                  {certificate.verification_url && (
                    <ButtonLink
                      href={certificate.verification_url}
                      size="sm"
                      variant="ghost"
                      className="text-[12.5px]"
                    >
                      <ExternalLink className="size-3.5" /> Verify
                    </ButtonLink>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-4xl">
          {active && (
            <div>
              <DialogTitle className="pr-8 text-lg">{active.title}</DialogTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                {active.issuer && <span>{active.issuer}</span>}
                {active.issue_date && <span>· {formatDate(active.issue_date)}</span>}
                {active.category && <Badge variant="outline">{active.category}</Badge>}
              </div>

              <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-muted">
                {active.file_url ? (
                  isPdf(active.file_url) ? (
                    <iframe
                      src={active.file_url}
                      title={`${active.title} PDF`}
                      className="h-[60vh] w-full"
                    />
                  ) : (
                    <div className="relative aspect-[4/3] w-full">
                      <SmartImage
                        src={active.file_url}
                        alt={active.title}
                        sizes="(max-width: 1024px) 100vw, 900px"
                        className="object-contain"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Images className="size-6" />
                    <p className="text-[12px]">No file uploaded yet.</p>
                  </div>
                )}
              </div>

              {active.description && (
                <p className="mt-4 text-[13.5px] leading-6 text-muted-foreground">
                  {active.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {active.file_url && (
                  <ButtonLink href={active.file_url} size="sm" variant="outline">
                    <FileText className="size-3.5" /> Open file
                  </ButtonLink>
                )}
                {active.verification_url && (
                  <ButtonLink href={active.verification_url} size="sm">
                    <ExternalLink className="size-3.5" /> Verify certificate
                  </ButtonLink>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
