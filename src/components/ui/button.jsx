import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[0.5px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
        accent:
          "bg-accent text-accent-foreground shadow-soft hover:bg-accent/90",
        outline:
          "border border-border bg-background text-foreground hover:border-accent/50 hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        subtle: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "h-auto p-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-10 px-4",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export function Button({ className, variant, size, asChild, ...props }) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild && props.href) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  return <button className={classes} {...props} />;
}

export function ButtonLink({ href, className, variant, size, target, rel, children, ...props }) {
  const external = /^https?:\/\//i.test(href || "");
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      target={target ?? (external ? "_blank" : undefined)}
      rel={rel ?? (external ? "noreferrer noopener" : undefined)}
      {...props}
    >
      {children}
    </Link>
  );
}
