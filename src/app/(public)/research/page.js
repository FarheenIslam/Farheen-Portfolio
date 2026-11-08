import { BookOpen, FlaskConical } from "lucide-react";
import { getPublications, getThesis, getProfile } from "@/lib/data";
import { PageHeader, Section, SectionHeading, EmptyState } from "@/components/public/section";
import { PublicationCard, ThesisCard } from "@/components/public/publication-card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Research & Publications",
  description:
    "Research publications on code-mixed Bangla-English depression detection, ML reliability in medical diagnosis, motorcycle traffic violation detection with YOLOR, and an ongoing thesis on image-based deepfake detection.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const [publications, thesis, profile] = await Promise.all([
    getPublications(),
    getThesis(),
    getProfile(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Publications & ongoing research"
        description="Peer-reviewed and published work, plus an undergraduate thesis in progress. Missing venue, year or DOI details are intentionally left blank until verified."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Papers"
              title="Publications"
              description={`${publications.length} ${publications.length === 1 ? "paper" : "papers"}`}
            />
            {publications.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No publications published yet"
                description="Publications added from the admin dashboard will appear here."
              />
            ) : (
              <div className="space-y-5">
                {publications.map((publication) => (
                  <PublicationCard key={publication.id} publication={publication} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="surface p-6">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                <FlaskConical className="size-4 text-accent" /> Research interests
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

            {thesis.map((item) => (
              <ThesisCard key={item.id} thesis={item} />
            ))}

            <div className="surface p-6">
              <h2 className="text-[13px] font-semibold">Collaboration</h2>
              <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
                Open to research collaboration and research assistant opportunities in computer
                vision, deepfake detection and applied machine learning.
              </p>
              <p className="mt-3 text-[13px]">
                <a href={`mailto:${profile.email}`} className="link-underline">
                  {profile.email}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
