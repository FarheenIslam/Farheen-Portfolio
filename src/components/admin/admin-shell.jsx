"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  History,
  UserRound,
  GraduationCap,
  Wrench,
  FolderKanban,
  BookOpen,
  FlaskConical,
  Award,
  Medal,
  Palette,
  Briefcase,
  CalendarDays,
  FileText,
  Images,
  Settings,
  ShieldCheck,
  Menu,
  ExternalLink,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/admin/actions/auth";

const ICONS = {
  LayoutDashboard,
  Inbox,
  History,
  UserRound,
  GraduationCap,
  Wrench,
  FolderKanban,
  BookOpen,
  FlaskConical,
  Award,
  Medal,
  Palette,
  Briefcase,
  CalendarDays,
  FileText,
  Images,
  Settings,
  ShieldCheck,
};

function NavList({ pathname, onNavigate }) {
  return (
    <nav aria-label="Admin" className="space-y-6">
      {ADMIN_NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ admin, children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLabel =
    ADMIN_NAV.flatMap((group) => group.items).find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    )?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-[12px] font-semibold text-primary-foreground">
            FB
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">Portfolio CMS</p>
            <p className="text-[11px] text-muted-foreground">Administrator</p>
          </div>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-3">
          <NavList pathname={pathname} />
          <div className="mt-8 rounded-xl border border-border bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground">Signed in as</p>
            <p className="mt-0.5 truncate text-[12.5px] font-medium">{admin.email}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {admin.full_name || "Administrator"}
            </p>
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="size-4" />
            </button>
            <h1 className="text-[13.5px] font-semibold">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              View site <ExternalLink className="size-3" />
            </Link>
            <ThemeToggle />
            <form action={signOutAction} className="lg:hidden">
              <button
                type="submit"
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>

        {admin.demo && (
          <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-800 dark:text-amber-300 sm:px-6">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <p>
              <strong>Demo mode.</strong> Supabase is not connected, so changes cannot be saved.
              Connect Supabase and sign in with a real administrator account to edit content.
            </p>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-border bg-background p-3">
            <div className="mb-4 flex items-center justify-between px-2">
              <p className="text-[13px] font-semibold">Portfolio CMS</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <form action={signOutAction} className="mt-6 px-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
