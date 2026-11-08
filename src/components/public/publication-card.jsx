import { FileText, Link2, ExternalLink, Presentation, Image as ImageIcon, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

const STATUS = {
  published: { label: "Published", variant: "success" },
  under_review: { label: "Under review", variant: "warning" },
  preprint: { label: "Preprint", variant: "muted" },
  conference: { label: "Conference paper", variant: "accent" },
  journal: { label: "Journal article", variant: "accent" },
};

export function PublicationCard({ publication }) {
  const status = STATUS[publication.publication_status] ?? STATUS.published;

  return (
    <article className="surface p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        {publication.publication_year && (
          <Badge variant="outline">{publication.publication_year}</Badge>
        )}
        {publication.is_featured && <Badge variant="accent">Featured</Badge>}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug">{publication.title}</h3>

      {publication.authors?.length > 0 && (
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          {publication.authors.join(", ")}
        </p>
      )}

      {publication.venue && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] italic text-muted-foreground">
          <Quote className="size-3.5" /> {publication.venue}
        </p>
      )}

      {publication.abstract && (
        <p className="mt-4 text-[14px] leading-7 text-muted-foreground">{publication.abstract}</p>
      )}

      {publication.keywords?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {publication.keywords.map((keyword) => (
            <li key={keyword}>
              <Badge variant="muted" className="font-normal">
                {keyword}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {publication.pdf_url && (
          <ButtonLink href={publication.pdf_url} size="sm" variant="outline">
            <FileText className="size-3.5" /> PDF
          </ButtonLink>
        )}
        {publication.poster_url && (
          <ButtonLink href={publication.poster_url} size="sm" variant="outline">
            <ImageIcon className="size-3.5" /> Poster
          </ButtonLink>
        )}
        {publication.presentation_url && (
          <ButtonLink href={publication.presentation_url} size="sm" variant="outline">
            <Presentation className="size-3.5" /> Slides
          </ButtonLink>
        )}
        {publication.doi && (
          <ButtonLink
            href={
              publication.doi.startsWith("http")
                ? publication.doi
                : `https://doi.org/${publication.doi}`
            }
            size="sm"
            variant="outline"
          >
            <Link2 className="size-3.5" /> DOI
          </ButtonLink>
        )}
        {publication.publication_url && (
          <ButtonLink href={publication.publication_url} size="sm" variant="subtle">
            <ExternalLink className="size-3.5" /> View publication
          </ButtonLink>
        )}
      </div>
    </article>
  );
}

export function ThesisCard({ thesis }) {
  if (!thesis) return null;

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Undergraduate thesis</Badge>
        {thesis.thesis_status && (
          <Badge variant="warning" className="capitalize">
            {thesis.thesis_status.replace("_", " ")}
          </Badge>
        )}
        {thesis.expected_year && (
          <Badge variant="outline">Expected {thesis.expected_year}</Badge>
        )}
      </div>
      <h3 className="mt-3 text-xl font-semibold">{thesis.title}</h3>
      {thesis.research_area && (
        <p className="mt-1 text-[13px] font-medium text-accent">{thesis.research_area}</p>
      )}
      {thesis.description && (
        <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{thesis.description}</p>
      )}
      {thesis.supervisor && (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Supervisor: <span className="text-foreground">{thesis.supervisor}</span>
        </p>
      )}
      {thesis.document_url && (
        <div className="mt-4">
          <ButtonLink href={thesis.document_url} size="sm" variant="outline">
            <FileText className="size-3.5" /> Thesis document
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
