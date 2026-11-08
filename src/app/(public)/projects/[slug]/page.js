import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, CircleDot, Layers } from "lucide-react";
import { Github } from "@/components/brand-icons";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Paragraphs } from "@/components/public/paragraphs";
import { ImageGrid } from "@/components/public/image-grid";
import { SmartImage } from "@/components/smart-image";
import { Section } from "@/components/public/section";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS = {
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary ?? project.tagline ?? `Project by Most. Farheen Islam Badhon`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      images: project.cover_image_url ? [project.cover_image_url] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const allProjects = await getProjects();
  const related = allProjects.filter((item) => item.id !== project.id).slice(0, 2);
  const gallery = (project.project_images ?? []).map((image) => ({
    url: image.url,
    caption: image.caption,
  }));

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="container-tight py-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All projects
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {project.category && <Badge variant="muted">{project.category}</Badge>}
            {STATUS_LABELS[project.project_status] && (
              <Badge variant={project.project_status === "in_progress" ? "warning" : "success"}>
                <CircleDot className="size-2.5" /> {STATUS_LABELS[project.project_status]}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-4xl">{project.title}</h1>
          {project.tagline && (
            <p className="mt-3 text-[15px] text-muted-foreground">{project.tagline}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {project.github_url && (
              <ButtonLink href={project.github_url} variant="outline" size="sm">
                <Github className="size-3.5" /> View source
              </ButtonLink>
            )}
            {project.live_url && (
              <ButtonLink href={project.live_url} variant="accent" size="sm">
                <ArrowUpRight className="size-3.5" /> Live demo
              </ButtonLink>
            )}
          </div>
        </div>
      </div>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <div>
            {project.cover_image_url && (
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
                <SmartImage
                  src={project.cover_image_url}
                  alt={project.title}
                  sizes="(max-width: 1024px) 100vw, 800px"
                  priority
                  className="object-cover"
                />
              </div>
            )}

            <h2 className="mb-4 text-xl font-semibold">Overview</h2>
            <Paragraphs text={project.description || project.summary} />

            {gallery.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Screenshots</h2>
                <ImageGrid images={gallery} />
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="surface p-6">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Project details
              </h2>
              <dl className="mt-4 space-y-3.5 text-sm">
                {project.category && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Category</dt>
                    <dd className="mt-0.5 font-medium">{project.category}</dd>
                  </div>
                )}
                {project.started_on && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Started</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      {formatDate(project.started_on)}
                    </dd>
                  </div>
                )}
                {project.technologies?.length > 0 && (
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      Technologies
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="font-normal">
                          {tech}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {related.length > 0 && (
              <div className="surface p-6">
                <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Layers className="size-3.5" /> More projects
                </h2>
                <ul className="mt-4 space-y-3">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/projects/${item.slug}`}
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
