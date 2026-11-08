"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[app error]", error?.message);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-[14px] leading-7 text-muted-foreground">
          An unexpected error stopped this page from loading. You can try again, or head back to the
          home page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button onClick={() => reset()} variant="accent">
            <RotateCcw className="size-4" /> Try again
          </Button>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
        <p className="mt-6 text-[11.5px] text-muted-foreground">
          If this keeps happening, please{" "}
          <Link href="/contact" className="link-underline">
            report it
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
