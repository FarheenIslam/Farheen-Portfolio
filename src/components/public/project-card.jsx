import Link from "next/link";
import { ArrowUpRight, CircleDot, FolderCode } from "lucide-react";
import { Github } from "@/components/brand-icons";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/smart-image";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  in_progress: "In progress",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectCard({ project, className }) {
  const status = STATUS_LABELS[project.project_status];

  return (
    <article
      className={cn(
        "group surface flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift",
        className
      )}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-navy-100 to-muted dark:from-navy-900 dark:to-muted"
      >
        {project.cover_image_url ? (
          <SmartImage
            src={project.cover_image_url}
            alt={project.title}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FolderCode className="size-7" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.16em]">Cover image pending</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {project.category && <Badge variant="muted">{project.category}</Badge>}
          {status && (
            <Badge variant={project.project_status === "in_progress" ? "warning" : "success"}>
              <CircleDot className="size-2.5" /> {status}
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/projects/${project.slug}`} className="hover:text-accent">
            {project.title}
          </Link>
        </h3>
        {project.tagline && (
          <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
            {project.tagline}
          </p>
        )}
        {project.summary && (
          <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-muted-foreground">
            {project.summary}
          </p>
        )}

        {(project.technologies ?? []).length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <li key={tech}>
                <Badge variant="outline" className="font-normal">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-3 text-[12px]">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="size-3.5" /> Code
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowUpRight className="size-3.5" /> Live
              </a>
            )}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
          >
            Details <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
