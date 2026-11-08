"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/smart-image";

export function ImageGrid({ images = [], columns = 2 }) {
  const [index, setIndex] = useState(null);
  const items = images.filter((image) => image?.url);

  if (items.length === 0) return null;

  const current = index === null ? null : items[index];

  return (
    <>
      <div
        className={
          columns === 3
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        {items.map((image, itemIndex) => (
          <button
            key={`${image.url}-${itemIndex}`}
            type="button"
            onClick={() => setIndex(itemIndex)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
          >
            <SmartImage
              src={image.url}
              alt={image.caption || `Gallery image ${itemIndex + 1}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute right-2.5 top-2.5 inline-flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
              <Maximize2 className="size-3.5" />
            </span>
            {image.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-3 text-left text-[12px] text-white">
                {image.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent className="max-w-6xl border-none bg-navy-950/95 p-0" showClose={false}>
          {current && (
            <div className="relative">
              <DialogTitle className="sr-only">{current.caption || "Image preview"}</DialogTitle>
              <div className="relative h-[80vh] w-full">
                <SmartImage
                  src={current.url}
                  alt={current.caption || "Image preview"}
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => setIndex(null)}
                aria-label="Close preview"
                className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground"
              >
                <X className="size-4" />
              </button>

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setIndex((value) => (value - 1 + items.length) % items.length)}
                    className="absolute left-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setIndex((value) => (value + 1) % items.length)}
                    className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-[11px] text-foreground">
                    {index + 1} / {items.length}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
