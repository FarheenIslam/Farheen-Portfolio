import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getSupabaseEnv } from "./config";

/**
 * Refreshes the Supabase auth session on every request and gates /admin.
 * This is the first (not the only) authorization layer: layouts, server
 * actions and RLS re-check admin rights on the server.
 */
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();

  if (!env) {
    return { response, user: null, configured: false };
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, configured: true, supabase };
}
