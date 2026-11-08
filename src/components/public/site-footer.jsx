import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { NAV_ITEMS } from "@/lib/site";

export function SiteFooter({ profile, settings }) {
  const year = new Date().getFullYear();
  const socials = [
    { href: profile?.github_url, label: "GitHub", Icon: Github },
    { href: profile?.linkedin_url, label: "LinkedIn", Icon: Linkedin },
    { href: profile?.email ? `mailto:${profile.email}` : null, label: "Email", Icon: Mail },
  ].filter((item) => item.href);

  return (
    <footer className="mt-8 border-t border-border bg-muted/40">
      <div className="container-tight grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl">{profile?.full_name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {profile?.headline}
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Explore
          </p>
          <ul className="space-y-2">
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Documents
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/resume"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Résumé &amp; CV
              </Link>
            </li>
            <li>
              <a
                href="/api/portfolio-pdf"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                PDF portfolio <ArrowUpRight className="size-3" />
              </a>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Admin sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-tight flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile?.full_name}. All rights reserved.
          </p>
          <p>{settings?.footer_note ?? "Built with Next.js, Supabase and care."}</p>
        </div>
      </div>
    </footer>
  );
}
