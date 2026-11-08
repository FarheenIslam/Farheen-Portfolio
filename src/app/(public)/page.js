import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Mail,
  Palette,
  Sparkles,
  Layers,
} from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { getPortfolioBundle } from "@/lib/data";
import { Hero } from "@/components/public/hero";
import { Section, SectionHeading, EmptyState } from "@/components/public/section";
import { Paragraphs } from "@/components/public/paragraphs";
import { EducationTimeline } from "@/components/public/education-timeline";
import { SkillsSection } from "@/components/public/skills-section";
import { ProjectCard } from "@/components/public/project-card";
import { PublicationCard, ThesisCard } from "@/components/public/publication-card";
import { DesignGallery } from "@/components/public/design-gallery";
import { ExperienceList, ActivityGrid, AchievementRow } from "@/components/public/experience-list";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const {
    profile,
    education,
    skills,
    projects,
    publications,
    thesis,
    achievements,
    designWorks,
    experiences,
    activities,
  } = await getPortfolioBundle();

  const featured = projects.filter((project) => project.is_featured);
  const showcaseProjects = (featured.length > 0 ? featured : projects).slice(0, 3);
  const designCategories = [...new Set(designWorks.map((work) => work.category))].filter(Boolean);
  const topInterests = (profile.research_interests ?? []).slice(0, 6);

  const stats = [
    { value: "2027", label: "Expected graduation", icon: GraduationCap },
    { value: "5.00", label: "SSC & HSC GPA", icon: Sparkles },
    { value: String(projects.length).padStart(2, "0"), label: "Projects", icon: Layers },
    { value: String(publications.length).padStart(2, "0"), label: "Research papers", icon: BookOpen },
  ];

  return (
    <>
      <Hero profile={profile} />

      <div className="container-tight">
        <div className="grid grid-cols-2 divide-border rounded-2xl border border-border bg-card shadow-soft sm:grid-cols-4 sm:divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-5">
              <stat.icon className="size-4 shrink-0 text-accent" />
              <div>
                <p className="font-serif text-lg leading-none">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Section id="about">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="About"
              title="A learner building toward trustworthy computer vision"
              href="/about"
              linkLabel="Full story"
            />
            <div className="mt-6 flex flex-wrap gap-1.5">
              {topInterests.map((interest) => (
                <Badge key={interest} variant="outline" className="font-normal">
                  {interest}
                </Badge>
              ))}
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  University
                </dt>
                <dd className="mt-1 font-medium">IUBAT</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Degree
                </dt>
                <dd className="mt-1 font-medium">BSc in CSE</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-1 font-medium">{profile.location}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Thesis
                </dt>
                <dd className="mt-1 font-medium">Image-based deepfake detection</dd>
              </div>
            </dl>
          </div>

          <Reveal>
            <div className="surface p-7">
              <Paragraphs text={profile.long_bio} className="[&>p]:text-[14.5px]" />
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <ButtonLink href="/about" variant="outline" size="sm">
                  Read more <ArrowRight className="size-3.5" />
                </ButtonLink>
                {profile.github_url && (
                  <Link
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    <Github className="size-3.5" /> GitHub
                  </Link>
                )}
                {profile.linkedin_url && (
                  <Link
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="size-3.5" /> LinkedIn
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="education" className="bg-muted/40">
        <SectionHeading
          eyebrow="Academic background"
          title="Education"
          description="Undergraduate study at IUBAT, preceded by HSC and SSC results of GPA 5.00."
          href="/about#education"
          linkLabel="Education details"
        />
        <EducationTimeline items={education} />
      </Section>

      <Section id="skills">
        <SectionHeading
          eyebrow="Capabilities"
          title="Technical skills"
          description="Honest labels only - no invented percentages. Everything here is coursework, self-study or practice."
          href="/about#skills"
          linkLabel="All skills"
        />
        <SkillsSection skills={skills} />
      </Section>

      <Section id="projects" className="border-y border-border bg-muted/40">
        <SectionHeading
          eyebrow="Selected work"
          title="Software projects"
          description="Coursework and personal projects, published as they are completed."
          href="/projects"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {showcaseProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Section>

      <Section id="research">
        <SectionHeading
          eyebrow="Research"
          title="Publications & ongoing research"
          description="Peer-reviewed work and an undergraduate thesis on image-based deepfake detection."
          href="/research"
        />
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {publications.slice(0, 2).map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
          <div className="space-y-5">
            <ThesisCard thesis={thesis[0]} />
            <div className="surface p-6">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                <BookOpen className="size-4 text-accent" /> Research interests
              </h3>
              <ul className="mt-4 space-y-2">
                {(profile.research_interests ?? []).map((interest) => (
                  <li
                    key={interest}
                    className="flex items-center gap-2 text-[13.5px] text-muted-foreground"
                  >
                    <span className="size-1 rounded-full bg-accent" /> {interest}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="design" className="border-y border-border bg-muted/40">
        <SectionHeading
          eyebrow="Creative practice"
          title="Design portfolio"
          description="UI/UX, graphic and academic design work - interfaces, posters, diagrams and visual systems."
          href="/designs"
        />
        {designWorks.length > 0 ? (
          <DesignGallery works={designWorks.slice(0, 6)} categories={designCategories} />
        ) : (
          <EmptyState
            icon={Palette}
            title="The design gallery is ready - work is being added"
            description="This gallery is managed entirely from the admin dashboard. Uploaded UI/UX, graphic and academic design work will appear here with filters, search and full-screen previews."
            action={
              <ButtonLink href="/designs" variant="outline" size="sm" className="mt-5">
                Visit the gallery <ArrowRight className="size-3.5" />
              </ButtonLink>
            }
          />
        )}
      </Section>

      <Section id="experience">
        <SectionHeading
          eyebrow="Beyond coursework"
          title="Experience & activities"
          description="Memberships, presentations and events."
          href="/experience"
        />
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <ExperienceList items={experiences} />
            {achievements.length > 0 && (
              <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Achievements
                </h3>
                <AchievementRow items={achievements.slice(0, 4)} />
              </div>
            )}
          </div>
          <ActivityGrid items={activities.slice(0, 4)} />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary px-6 py-14 text-primary-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
              Let's work together
            </p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Open to research collaboration, research assistant roles and remote work.
            </h2>
            <p className="mt-3 text-[14.5px] leading-7 text-primary-foreground/70">
              {profile.email} · {profile.location}
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ButtonLink
                href="/contact"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Mail className="size-4" /> Get in touch
              </ButtonLink>
              <ButtonLink
                href="/api/portfolio-pdf"
                variant="outline"
                className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                Download PDF portfolio
              </ButtonLink>
            </div>
          </div>
          <p className="relative mt-8 text-[11px] text-primary-foreground/50">
            Last updated {formatDate(profile.updated_at)}
          </p>
        </div>
      </Section>
    </>
  );
}
