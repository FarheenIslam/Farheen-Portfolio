import { Building2, CalendarDays, MapPin, Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMonthYear } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";

export function ExperienceList({ items = [] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3.5">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Building2 className="size-4" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold">{item.role}</h3>
                {item.kind && <Badge variant="muted">{item.kind}</Badge>}
              </div>
              <p className="text-[13px] text-muted-foreground">{item.organization}</p>
              {item.description && (
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          <p className="shrink-0 text-[12px] text-muted-foreground">
            {item.is_current
              ? `${formatMonthYear(item.start_date)} — Present`
              : [formatMonthYear(item.start_date), formatMonthYear(item.end_date)]
                  .filter(Boolean)
                  .join(" — ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ActivityGrid({ items = [] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="surface flex flex-col overflow-hidden">
          {item.image_url && (
            <div className="relative aspect-[16/9] bg-muted">
              <SmartImage src={item.image_url} alt={item.title} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formatDate(item.event_date, { month: "short" })}
            </div>
            <h3 className="mt-2 text-[15px] font-semibold leading-snug">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">{item.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
              {item.role && (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {item.role}
                </span>
              )}
              {item.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {item.location}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AchievementRow({ items = [] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3.5 p-4">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Sparkles className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-medium">{item.title}</p>
            <p className="text-[12.5px] text-muted-foreground">
              {[item.issuer, formatDate(item.achieved_on)].filter(Boolean).join(" · ")}
            </p>
          </div>
          {item.category && <Badge variant="outline">{item.category}</Badge>}
        </li>
      ))}
    </ul>
  );
}
