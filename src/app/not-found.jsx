import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
          <Compass className="size-5" />
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold">This page does not exist</h1>
        <p className="mx-auto mt-3 max-w-sm text-[14px] leading-7 text-muted-foreground">
          The link may be outdated, or the content may have been moved or unpublished.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/" variant="accent">
            <ArrowLeft className="size-4" /> Back to home
          </ButtonLink>
          <ButtonLink href="/projects" variant="outline">
            Browse projects
          </ButtonLink>
        </div>
        <p className="mt-8 text-[12px] text-muted-foreground">
          Looking for something specific?{" "}
          <Link href="/contact" className="link-underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
