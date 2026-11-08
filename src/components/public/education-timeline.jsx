import { GraduationCap, MapPin, CalendarDays, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatYear } from "@/lib/utils";

export function EducationTimeline({ items = [] }) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6 sm:pl-8">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full border border-border bg-background sm:-left-[39px]">
            <span className="size-1.5 rounded-full bg-accent" />
          </span>

          <div className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{item.degree}</h3>
                  {item.is_current && <Badge variant="accent">Current</Badge>}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GraduationCap className="size-3.5 shrink-0" />
                  {item.institution}
                </p>
                {item.department && (
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{item.department}</p>
                )}
              </div>

              <div className="flex flex-col items-start gap-1.5 text-[12px] text-muted-foreground sm:items-end">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {item.is_current
                    ? `${item.start_year ? `${item.start_year} — ` : ""}Expected ${item.end_year ?? ""}`
                    : [item.start_year, item.end_year].filter(Boolean).join(" — ") ||
                      formatYear(item.end_year)}
                </span>
                {item.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {item.location}
                  </span>
                )}
              </div>
            </div>

            {(item.result || item.description) && (
              <div className="mt-4 border-t border-border pt-4">
                {item.result && (
                  <p className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-600/10 px-2 py-1 text-[12px] font-medium text-emerald-700 dark:text-emerald-400">
                    <Award className="size-3.5" />
                    GPA {item.result}
                    {item.result_scale ? ` / ${item.result_scale}` : ""}
                  </p>
                )}
                {item.description && (
                  <p className="text-[14px] leading-6 text-muted-foreground">{item.description}</p>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
