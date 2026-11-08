"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Print" }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
      <Printer className="size-3.5" /> {label}
    </Button>
  );
}
