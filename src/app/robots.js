import { absoluteUrl } from "@/lib/utils";
import { requestOrigin } from "@/lib/site-url";

export default async function robots() {
  const origin = await requestOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml", origin),
    host: new URL(origin).host,
  };
}
