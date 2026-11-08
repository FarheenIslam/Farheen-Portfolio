import { Download, FileText, Mail, MapPin } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { getPortfolioBundle } from "@/lib/data";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/public/section";
import { PrintButton } from "@/components/public/print-button";
import { formatMonthYear, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Résumé & CV",
  description:
    "Curriculum vitae of Most. Farheen Islam Badhon, downloadable as a PDF, plus the full PDF portfolio.",
  alternates: { canonical: "/resume" },
};

function CvSection({ title, children }) {
  return (
    <section className="border-t border-border py-5 first:border-0 first:pt-0">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ResumePage() {
  const { profile, education, skills, projects, publications, experiences, activities } =
    await getPortfolioBundle();

  const skillGroups = ["Programming", "Database", "Design Tools", "Research Interests"]
    .map((category) => ({
      category,
      items: skills.filter((skill) => skill.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <div className="border-b border-border bg-muted/30 print:hidden">
        <div className="container-tight py-12">
          <p className="eyebrow mb-3">Documents</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Résumé &amp; CV</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            The CV and portfolio PDF are generated from the latest published content, so they are
            always in sync with this website.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <ButtonLink href="/api/cv-pdf" variant="accent">
              <Download className="size-4" /> Download CV (PDF)
            </ButtonLink>
            <ButtonLink href="/api/portfolio-pdf" variant="outline">
              <FileText className="size-4" /> Download portfolio (PDF)
            </ButtonLink>
            <PrintButton label="Print this page" />
          </div>
          {profile.resume_url && (
            <p className="mt-4 text-[12.5px] text-muted-foreground">
              A manually uploaded CV is also available:{" "}
              <a href={profile.resume_url} className="link-underline" target="_blank" rel="noreferrer">
                open file
              </a>
            </p>
          )}
        </div>
      </div>

      <Section className="print:py-0">
        <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-soft sm:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <header className="pb-5">
            <h2 className="text-2xl font-semibold">{profile.full_name}</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">{profile.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Mail className="size-3.5" /> {profile.email}
              </a>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {profile.location}
              </span>
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Github className="size-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Linkedin className="size-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </header>

          <CvSection title="Profile">
            <p className="text-[13.5px] leading-6 text-muted-foreground">{profile.short_bio}</p>
          </CvSection>

          <CvSection title="Education">
            <ul className="space-y-3">
              {education.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13.5px] font-medium">{item.degree}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {item.is_current
                        ? `Expected ${item.end_year ?? ""}`
                        : [item.start_year, item.end_year].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground">{item.institution}</p>
                  {item.result && (
                    <p className="text-[12px] text-muted-foreground">
                      GPA {item.result}
                      {item.result_scale ? ` / ${item.result_scale}` : ""}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection title="Technical skills">
            <dl className="space-y-1.5">
              {skillGroups.map((group) => (
                <div key={group.category} className="flex gap-2 text-[13px]">
                  <dt className="w-36 shrink-0 font-medium">{group.category}</dt>
                  <dd className="text-muted-foreground">
                    {group.items.map((skill) => skill.name).join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </CvSection>

          <CvSection title="Projects">
            <ul className="space-y-3">
              {projects.map((project) => (
                <li key={project.id}>
                  <p className="text-[13.5px] font-medium">{project.title}</p>
                  {project.summary && (
                    <p className="text-[12.5px] leading-6 text-muted-foreground">{project.summary}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <p className="text-[12px] text-muted-foreground">
                      {project.technologies.join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection title="Research">
            <ul className="space-y-2">
              {publications.map((publication) => (
                <li key={publication.id} className="text-[13px]">
                  <p className="font-medium">{publication.title}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {[publication.venue, publication.publication_year].filter(Boolean).join(" · ")}
                    {publication.authors?.length > 0 && ` — ${publication.authors.join(", ")}`}
                  </p>
                </li>
              ))}
            </ul>
          </CvSection>

          <CvSection title="Experience & activities">
            <ul className="space-y-2">
              {experiences.map((item) => (
                <li key={item.id} className="text-[13px]">
                  <span className="font-medium">{item.role}</span> · {item.organization}
                  <span className="text-[12px] text-muted-foreground">
                    {" "}
                    ({[formatMonthYear(item.start_date), item.is_current ? "Present" : formatMonthYear(item.end_date)]
                      .filter(Boolean)
                      .join(" — ")})
                  </span>
                </li>
              ))}
              {activities.map((item) => (
                <li key={item.id} className="text-[13px]">
                  {item.title}
                  <span className="text-[12px] text-muted-foreground"> · {formatDate(item.event_date)}</span>
                </li>
              ))}
            </ul>
          </CvSection>
        </article>
      </Section>
    </>
  );
}
