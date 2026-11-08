/**
 * Supabase environment helpers.
 *
 * The public site can render without Supabase connected (it falls back to the
 * content in src/lib/defaults.js). The admin area requires Supabase.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase now offers publishable keys (sb_publishable_...) which replace the
  // legacy anon key. Either name is accepted; both are public by design.
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) return null;

  // Guard against the placeholder values from .env.local.example.
  if (url.includes("your-project-ref") || anonKey.includes("your-anon")) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseEnv());
}

/** True only for local development without Supabase, so the UI can be reviewed. */
export const DEMO_MODE =
  !isSupabaseConfigured() && process.env.NODE_ENV !== "production";

export const STORAGE_BUCKETS = {
  images: "portfolio-images",
  documents: "portfolio-documents",
  privateDocuments: "private-documents",
};
