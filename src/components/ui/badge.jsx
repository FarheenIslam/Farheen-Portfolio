import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/5 text-primary dark:bg-primary/10",
        outline: "border-border text-muted-foreground",
        accent: "border-accent/20 bg-accent/10 text-accent",
        success: "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
        warning: "border-amber-600/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
