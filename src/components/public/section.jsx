import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({ children, className, id }) {
  return (
    <section id={id} className={cn("section", className)}>
      <div className="container-tight">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  className,
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold sm:text-[28px]">{title}</h2>
        {description && (
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <p className="font-serif text-lg">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container-tight py-14 sm:py-16">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
