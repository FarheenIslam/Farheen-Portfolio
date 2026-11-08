"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Images,
  Layers,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Figma } from "@/components/brand-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "@/components/public/filter-bar";
import { EmptyState } from "@/components/public/section";
import { SmartImage } from "@/components/smart-image";
import { cn, formatDate } from "@/lib/utils";

const ASPECTS = ["aspect-[4/3]", "aspect-square", "aspect-[4/5]", "aspect-[4/3]", "aspect-[3/4]"];

export function DesignGallery({ works = [], categories = [], columns = 3 }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return works.filter((work) => {
      const inCategory = category === "All" || work.category === category;
      const inQuery =
        !needle ||
        [work.title, work.short_description, work.category, ...(work.tools ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return inCategory && inQuery;
    });
  }, [works, category, query]);

  function openWork(work) {
    setActive(work);
    setActiveImage(0);
  }

  const images = active
    ? [active.cover_image_url, ...(active.design_work_images ?? []).map((image) => image.url)].filter(Boolean)
    : [];

  return (
    <div>
      <FilterBar
        categories={categories}
        active={category}
        onChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search designs, tools, categories…"
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No designs match this view"
          description={
            works.length === 0
              ? "Design work added from the admin dashboard appears here as a visual gallery."
              : "Try a different category or search term."
          }
        />
      ) : (
        <div
          className={cn(
            "gap-5 [column-fill:_balance]",
            columns === 3 ? "columns-1 sm:columns-2 lg:columns-3" : "columns-1 sm:columns-2"
          )}
        >
          {filtered.map((work, index) => (
            <article key={work.id} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => openWork(work)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className={cn("relative w-full overflow-hidden bg-muted", ASPECTS[index % ASPECTS.length])}>
                  {work.cover_image_url ? (
                    <SmartImage
                      src={work.cover_image_url}
                      alt={work.title}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Layers className="size-6" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-[13px] font-medium text-white">{work.title}</p>
                    <p className="text-[11px] text-white/70">{work.category}</p>
                  </div>
                  <span className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
                    <Maximize2 className="size-3.5" />
                  </span>
                  {work.is_featured && (
                    <span className="absolute left-3 top-3">
                      <Badge variant="accent">Featured</Badge>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {work.category}
                  </p>
                  <h3 className="mt-1 text-[14.5px] font-semibold leading-snug">{work.title}</h3>
                  {work.short_description && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                      {work.short_description}
                    </p>
                  )}
                  {(work.tools ?? []).length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1">
                      {work.tools.slice(0, 3).map((tool) => (
                        <li key={tool}>
                          <Badge variant="muted" className="font-normal">
                            {tool}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-5xl p-0" showClose={false}>
          {active && (
            <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.35fr_1fr]">
              <div className="relative bg-navy-950">
                <DialogTitle className="sr-only">{active.title}</DialogTitle>
                <div className="relative flex aspect-[4/3] items-center justify-center lg:aspect-auto lg:h-full lg:min-h-[26rem]">
                  {images.length > 0 ? (
                    <SmartImage
                      src={images[activeImage]}
                      alt={`${active.title} preview`}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain"
                    />
                  ) : (
                    <Layers className="size-8 text-white/40" />
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() =>
                          setActiveImage((index) => (index - 1 + images.length) % images.length)
                        }
                        className="absolute left-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setActiveImage((index) => (index + 1) % images.length)}
                        className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] text-foreground">
                        {activeImage + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View image ${index + 1}`}
                        className={cn(
                          "relative size-14 shrink-0 overflow-hidden rounded-md border-2",
                          index === activeImage ? "border-accent" : "border-transparent opacity-70"
                        )}
                      >
                        <SmartImage src={image} alt="" sizes="56px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative bg-card p-6">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close preview"
                  className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>

                <Badge variant="accent">{active.category}</Badge>
                <h2 className="mt-3 pr-8 text-xl font-semibold leading-snug">{active.title}</h2>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                  {active.created_on && <span>{formatDate(active.created_on)}</span>}
                  {active.tools?.length > 0 && <span>{active.tools.join(" · ")}</span>}
                </div>

                {active.description && (
                  <p className="mt-4 whitespace-pre-line text-[13.5px] leading-6 text-muted-foreground">
                    {active.description}
                  </p>
                )}

                {active.objectives?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Objectives
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-[13.5px] leading-6 text-muted-foreground">
                      {active.objectives.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {active.process?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Process
                    </h3>
                    <ol className="mt-2 space-y-1.5 text-[13.5px] leading-6 text-muted-foreground">
                      {active.process.map((step, index) => (
                        <li key={step} className="flex gap-2">
                          <span className="text-accent">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {active.figma_url && (
                    <ButtonLink href={active.figma_url} size="sm" variant="outline">
                      <Figma className="size-3.5" /> Prototype
                    </ButtonLink>
                  )}
                  {active.live_url && (
                    <ButtonLink href={active.live_url} size="sm" variant="outline">
                      <ArrowUpRight className="size-3.5" /> Live preview
                    </ButtonLink>
                  )}
                  <Link
                    href={`/designs/${active.slug}`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-secondary px-3 text-[13px] font-medium text-secondary-foreground hover:bg-secondary/70"
                  >
                    Full case study <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
