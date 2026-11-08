import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "2025-12-28" -> "28 December 2025" */
export function formatDate(value, { month = "long" } = {}) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
  });
}

/** "2025-12-28" -> "December 2025" */
export function formatMonthYear(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function formatYear(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return String(date.getFullYear());
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function truncate(value = "", length = 160) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1).trimEnd()}…`;
}

/**
 * Canonical origin used at build time. Set NEXT_PUBLIC_SITE_URL when the site
 * moves to a custom domain; the published Sites origin is the default so
 * metadata never points at localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://site-ea917db4023d486f95ba83e6f79a52fb.freebuff.page"
).replace(/\/$/, "");

export function absoluteUrl(path = "/", base = SITE_URL) {
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function yearRange(start, end, isCurrent) {
  const from = start || "";
  if (isCurrent) return `${from} — Present`.trim();
  return [from, end].filter(Boolean).join(" — ");
}

export function readingTime(text = "") {
  const words = String(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
