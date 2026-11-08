import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  const { response, user, configured } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Without Supabase the app runs in local demo mode; the admin layout uses a
  // separate demo cookie gate so the dashboard can still be reviewed.
  if (!configured) return response;

  const isPublicAdminRoute =
    pathname === "/admin/login" || pathname.startsWith("/admin/invite");

  if (pathname.startsWith("/admin") && !isPublicAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicAdminRoute && user && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
