export function Paragraphs({ text, className = "" }) {
  if (!text) return null;
  const paragraphs = String(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 text-[15px] leading-7 text-muted-foreground last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function BulletLines({ text, className = "" }) {
  if (!text) return null;
  const lines = String(text)
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return (
    <ul className={`space-y-2 ${className}`}>
      {lines.map((line) => (
        <li key={line} className="flex gap-2.5 text-[14px] leading-6 text-muted-foreground">
          <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
          {line}
        </li>
      ))}
    </ul>
  );
}
