"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Download } from "lucide-react";
import { NAV_ITEMS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SiteHeader({ name = "Most. Farheen Islam Badhon" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent transition-colors duration-300",
        scrolled
          ? "border-border/80 bg-background/85 backdrop-blur-md"
          : "bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="container-tight flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[13px] font-semibold tracking-tight text-primary-foreground">
            FB
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13px] font-semibold tracking-tight">{name}</span>
            <span className="text-[11px] text-muted-foreground">
              CSE · IUBAT · Bangladesh
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <ButtonLink
            href="/resume"
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Download className="size-3.5" />
            Résumé
          </ButtonLink>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle className="sr-only">Navigation</DialogTitle>
              <nav aria-label="Mobile" className="mt-2 flex flex-col">
                {[{ href: "/", label: "Home" }, ...NAV_ITEMS, { href: "/resume", label: "Résumé & CV" }].map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between border-b border-border/70 py-3 text-sm font-medium last:border-0"
                    >
                      {item.label}
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                    </Link>
                  )
                )}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
