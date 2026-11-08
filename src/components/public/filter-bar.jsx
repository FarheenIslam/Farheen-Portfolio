"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterBar({
  categories = [],
  active,
  onChange,
  query,
  onQueryChange,
  placeholder = "Search…",
  resultCount,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="tablist"
        aria-label="Filter by category"
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5"
      >
        {["All", ...categories].map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            onClick={() => onChange(category)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active === category
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {typeof resultCount === "number" && (
          <span className="hidden text-[12px] text-muted-foreground sm:inline">
            {resultCount} {resultCount === 1 ? "item" : "items"}
          </span>
        )}
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-ring/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
