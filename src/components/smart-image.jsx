import Image from "next/image";

/**
 * Uses next/image (optimised, lazy) for files in Supabase Storage and for local
 * assets. Absolute URLs from other hosts fall back to a lazy <img> so the site
 * never crashes because of an unconfigured remote pattern.
 */
export function SmartImage({
  src,
  alt = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
  imgClassName = "",
}) {
  if (!src) return null;

  const isLocal = src.startsWith("/");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isSupabase = Boolean(supabaseUrl) && src.startsWith(supabaseUrl);

  if (isLocal || isSupabase) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className || imgClassName}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className || imgClassName}`}
    />
  );
}
