import { Download, Mail, MapPin, Target, GraduationCap, Microscope, BookOpen } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import Link from "next/link";
import { getProfile, getEducation, getSkills, getThesis } from "@/lib/data";
import { PageHeader, Section, SectionHeading } from "@/components/public/section";
import { Paragraphs } from "@/components/public/paragraphs";
import { EducationTimeline } from "@/components/public/education-timeline";
import { SkillsSection } from "@/components/public/skills-section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ThesisCard } from "@/components/public/publication-card";

export const metadata = {
  title: "About",
  description:
    "Biography, academic background, research interests and learning goals of Most. Farheen Islam Badhon, CSE undergraduate at IUBAT.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [profile, education, skills, thesis] = await Promise.all([
    getProfile(),
    getEducation(),
    getSkills(),
    getThesis(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="About me"
        title="An honest introduction"
        description={profile.headline}
      >
        <div className="mt-6 flex flex-wrap gap-2.5">
          <ButtonLink href="/api/cv-pdf" variant="accent" size="sm">
            <Download className="size-3.5" /> Download CV
          </ButtonLink>
          <ButtonLink href={`mailto:${profile.email}`} variant="outline" size="sm">
            <Mail className="size-3.5" /> {profile.email}
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <div>
            <SectionHeading eyebrow="Biography" title="Where I am, and where I am going" />
            <Paragraphs text={profile.long_bio} />
          </div>

          <aside className="space-y-5">
            <div className="surface p-6">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                At a glance
              </h2>
              <dl className="mt-4 space-y-3.5 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium">
                    <MapPin className="size-3.5 text-muted-foreground" /> {profile.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">University</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium">
                    <GraduationCap className="size-3.5 text-muted-foreground" /> IUBAT
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Degree</dt>
                  <dd className="mt-0.5 font-medium">BSc in Computer Science & Engineering</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Expected graduation</dt>
                  <dd className="mt-0.5 font-medium">2027</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Availability</dt>
                  <dd className="mt-0.5 font-medium">{profile.availability}</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                {profile.github_url && (
                  <Link
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                    aria-label="GitHub"
                  >
                    <Github className="size-3.5" />
                  </Link>
                )}
                {profile.linkedin_url && (
                  <Link
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="size-3.5" />
                  </Link>
                )}
                <Link
                  href={`mailto:${profile.email}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Email"
                >
                  <Mail className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="surface p-6">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                <Microscope className="size-4 text-accent" /> Research interests
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {(profile.research_interests ?? []).map((interest) => (
                  <li key={interest}>
                    <Badge variant="outline" className="font-normal">
                      {interest}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section className="border-y border-border bg-muted/40" id="education">
        <SectionHeading
          eyebrow="Academic background"
          title="Education"
          description="BSc in Computer Science and Engineering at IUBAT, with HSC and SSC completed at GPA 5.00."
        />
        <EducationTimeline items={education} />
      </Section>

      <Section id="skills">
        <SectionHeading
          eyebrow="Capabilities"
          title="Technical skills & tools"
          description="Skills are labelled Beginner, Intermediate or Advanced based on honest self-assessment - never invented percentages."
        />
        <SkillsSection skills={skills} />
      </Section>

      <Section className="border-t border-border bg-muted/40">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface p-6">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <Target className="size-4 text-accent" /> Current learning goals
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{profile.learning_goals}</p>
          </div>
          <div className="surface p-6">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold">
              <BookOpen className="size-4 text-accent" /> Future career goals
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{profile.career_goals}</p>
          </div>
        </div>

        {thesis[0] && (
          <div className="mt-6">
            <ThesisCard thesis={thesis[0]} />
          </div>
        )}
      </Section>
    </>
  );
}
