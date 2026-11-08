import { headers } from "next/headers";
import { SITE_URL } from "@/lib/utils";

/**
 * Origin of the current request, so the sitemap and robots.txt always describe
 * the host the site is actually served from (preview or production) instead of
 * a build-time guess. Falls back to the canonical URL when no host is present.
 */
export async function requestOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0].trim() ||
    requestHeaders.get("host");

  if (!host) return SITE_URL;

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol =
    forwardedProtocol || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");

  return `${protocol}://${host}`;
}
