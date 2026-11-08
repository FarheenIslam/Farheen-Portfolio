import { getExperiences, getActivities, getAchievements } from "@/lib/data";
import { PageHeader, Section, SectionHeading } from "@/components/public/section";
import { ExperienceList, ActivityGrid, AchievementRow } from "@/components/public/experience-list";

export const metadata = {
  title: "Experience & Activities",
  description:
    "Memberships, presentations, workshops and events of Most. Farheen Islam Badhon, including IUBAT IT Society, Humanitarian Poster Presentation, Craft Your CV and the IIEC Innovation quiz.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const [experiences, activities, achievements] = await Promise.all([
    getExperiences(),
    getActivities(),
    getAchievements(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Beyond coursework"
        title="Experience & activities"
        description="Memberships, presentations and events. New entries are added from the admin dashboard as they happen."
      />

      <Section>
        <SectionHeading eyebrow="Experience" title="Roles & memberships" />
        <ExperienceList items={experiences} />
      </Section>

      <Section className="border-y border-border bg-muted/40">
        <SectionHeading
          eyebrow="Activities"
          title="Events & presentations"
          description="Conferences, workshops, quizzes and poster sessions."
        />
        <ActivityGrid items={activities} />
      </Section>

      {achievements.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Recognition" title="Achievements" />
          <AchievementRow items={achievements} />
        </Section>
      )}
    </>
  );
}
