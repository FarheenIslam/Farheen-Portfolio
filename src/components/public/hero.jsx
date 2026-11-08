import Link from "next/link";
import {
  ArrowRight,
  Download,
  Mail,
  Sparkles,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/smart-image";
import { initials } from "@/lib/utils";

export function Hero({ profile }) {
  if (!profile) return null;

  const interests = (profile.interests ?? []).slice(0, 6);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="container-tight grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            {profile.availability || "Open to research collaboration"}
          </div>

          <h1 className="mt-6 text-4xl leading-[1.08] sm:text-5xl lg:text-[56px]">
            {profile.full_name}
          </h1>

          <p className="mt-4 max-w-xl text-[15px] font-medium leading-7 text-muted-foreground sm:text-base">
            {profile.headline}
          </p>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
            {profile.short_bio}
          </p>

          {interests.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <li key={interest}>
                  <Badge variant="muted" className="font-normal">
                    {interest}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ButtonLink href="/projects" variant="accent">
              View projects
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/api/cv-pdf" variant="outline">
              <Download className="size-4" />
              Download CV
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              <Mail className="size-4" />
              Contact me
            </ButtonLink>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {[
                { href: profile.github_url, label: "GitHub", Icon: Github },
                { href: profile.linkedin_url, label: "LinkedIn", Icon: Linkedin },
                { href: profile.email ? `mailto:${profile.email}` : null, label: "Email", Icon: Mail },
              ]
                .filter((item) => item.href)
                .map(({ href, label, Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </Link>
                ))}
            </div>
            <span className="h-5 w-px bg-border" />
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> {profile.location || "Bangladesh"}
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-navy-100 via-background to-accent/5 shadow-lift dark:from-navy-900 dark:via-card dark:to-accent/10">
            {profile.avatar_url ? (
              <SmartImage
                src={profile.avatar_url}
                alt={`Portrait of ${profile.full_name}`}
                sizes="(max-width: 1024px) 90vw, 420px"
                priority
                className="object-cover"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-grid-fade opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <span className="flex size-24 items-center justify-center rounded-full border border-border/70 bg-background/70 font-serif text-3xl text-foreground shadow-soft backdrop-blur-sm">
                    {initials(profile.full_name)}
                  </span>
                  <p className="max-w-[15rem] text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Profile photo will appear here once uploaded
                  </p>
                </div>
              </>
            )}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950/25 to-transparent"
            />
          </div>

          <div className="absolute -bottom-5 -left-4 hidden w-52 rounded-xl border border-border bg-card p-3.5 shadow-lift sm:block">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <GraduationCap className="size-3.5" /> Expected 2027
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug">
              BSc in Computer Science &amp; Engineering, IUBAT
            </p>
          </div>

          <div className="absolute -right-3 top-5 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lift sm:block">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" /> Research-driven
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
