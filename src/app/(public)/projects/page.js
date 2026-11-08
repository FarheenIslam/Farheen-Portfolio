import { getProjects } from "@/lib/data";
import { PageHeader, Section, EmptyState } from "@/components/public/section";
import { ProjectCard } from "@/components/public/project-card";
import { FolderKanban } from "lucide-react";

export const metadata = {
  title: "Projects",
  description:
    "Software projects by Most. Farheen Islam Badhon, including InventoryPro Commerce, an alumni management system, delivery analytics and a bus seat booking system.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.is_featured);
  const others = projects.filter((project) => !project.is_featured);

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Software projects"
        description="Academic and personal software work. Each project page is maintained from the admin dashboard with its real stack, screenshots and links - nothing is invented here."
      />

      <Section>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects published yet"
            description="Projects added and published from the admin dashboard will appear here."
          />
        ) : (
          <div className="space-y-12">
            {featured.length > 0 && (
              <div>
                <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Featured
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {featured.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  More projects
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {others.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
