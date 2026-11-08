import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Frame, CalendarDays } from "lucide-react";
import { Figma } from "@/components/brand-icons";
import { getDesignWorkBySlug, getDesignWorks } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Paragraphs } from "@/components/public/paragraphs";
import { ImageGrid } from "@/components/public/image-grid";
import { SmartImage } from "@/components/smart-image";
import { Section } from "@/components/public/section";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const work = await getDesignWorkBySlug(slug);

  if (!work) return { title: "Design not found" };

  return {
    title: work.title,
    description: work.short_description ?? `${work.category} design work`,
    alternates: { canonical: `/designs/${work.slug}` },
    openGraph: {
      title: work.title,
      description: work.short_description ?? undefined,
      images: work.cover_image_url ? [work.cover_image_url] : undefined,
    },
  };
}

export default async function DesignDetailPage({ params }) {
  const { slug } = await params;
  const work = await getDesignWorkBySlug(slug);

  if (!work) notFound();

  const allWorks = await getDesignWorks();
  const more = allWorks.filter((item) => item.id !== work.id).slice(0, 3);
  const gallery = (work.design_work_images ?? []).map((image) => ({
    url: image.url,
    caption: image.caption,
  }));

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="container-tight py-10">
          <Link
            href="/designs"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Design gallery
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{work.category}</Badge>
            {work.created_on && (
              <Badge variant="outline">
                <CalendarDays className="size-2.5" /> {formatDate(work.created_on)}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-4xl">{work.title}</h1>
          {work.short_description && (
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              {work.short_description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {work.figma_url && (
              <ButtonLink href={work.figma_url} variant="accent" size="sm">
                <Figma className="size-3.5" /> Open prototype
              </ButtonLink>
            )}
            {work.live_url && (
              <ButtonLink href={work.live_url} variant="outline" size="sm">
                <ArrowUpRight className="size-3.5" /> Live preview
              </ButtonLink>
            )}
            {work.source_url && (
              <ButtonLink href={work.source_url} variant="ghost" size="sm">
                <Frame className="size-3.5" /> Source files
              </ButtonLink>
            )}
          </div>
        </div>
      </div>

      <Section>
        {work.cover_image_url && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
            <SmartImage
              src={work.cover_image_url}
              alt={work.title}
              sizes="(max-width: 1280px) 100vw, 1100px"
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <div>
            {work.description && (
              <>
                <h2 className="mb-4 text-xl font-semibold">Overview</h2>
                <Paragraphs text={work.description} />
              </>
            )}

            {gallery.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Gallery</h2>
                <ImageGrid images={gallery} columns={3} />
              </div>
            )}
          </div>

          <aside className="space-y-5">
            {work.tools?.length > 0 && (
              <div className="surface p-6">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Tools used
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {work.tools.map((tool) => (
                    <li key={tool}>
                      <Badge variant="outline" className="font-normal">
                        {tool}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {work.objectives?.length > 0 && (
              <div className="surface p-6">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Objectives
                </h2>
                <ul className="mt-3 space-y-2">
                  {work.objectives.map((objective) => (
                    <li key={objective} className="flex gap-2 text-[13.5px] leading-6 text-muted-foreground">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {work.process?.length > 0 && (
              <div className="surface p-6">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Design process
                </h2>
                <ol className="mt-3 space-y-2">
                  {work.process.map((step, index) => (
                    <li key={step} className="flex gap-2 text-[13.5px] leading-6 text-muted-foreground">
                      <span className="font-medium text-accent">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {more.length > 0 && (
              <div className="surface p-6">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  More design work
                </h2>
                <ul className="mt-4 space-y-3">
                  {more.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/designs/${item.slug}`}
                        className="group flex items-start justify-between gap-2"
                      >
                        <span className="text-[13.5px] font-medium leading-snug group-hover:text-accent">
                          {item.title}
                        </span>
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
