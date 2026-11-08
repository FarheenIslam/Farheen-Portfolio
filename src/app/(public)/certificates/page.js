import { getCertificates, getAchievements } from "@/lib/data";
import { PageHeader, Section, SectionHeading } from "@/components/public/section";
import { CertificateGallery } from "@/components/public/certificate-gallery";
import { AchievementRow } from "@/components/public/experience-list";

export const metadata = {
  title: "Certificates & Achievements",
  description:
    "Academic, course, workshop and research certificates plus achievements of Most. Farheen Islam Badhon.",
  alternates: { canonical: "/certificates" },
};

export default async function CertificatesPage() {
  const [certificates, achievements] = await Promise.all([getCertificates(), getAchievements()]);

  return (
    <>
      <PageHeader
        eyebrow="Credentials"
        title="Certificates & achievements"
        description="Filter by category or search by name. Each certificate can be previewed in full, with a verification link where one exists."
      />

      <Section>
        <CertificateGallery certificates={certificates} />
      </Section>

      {achievements.length > 0 && (
        <Section className="border-t border-border bg-muted/40">
          <SectionHeading eyebrow="Recognition" title="Achievements" />
          <AchievementRow items={achievements} />
        </Section>
      )}
    </>
  );
}
