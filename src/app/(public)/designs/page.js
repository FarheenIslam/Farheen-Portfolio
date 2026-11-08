import { Palette } from "lucide-react";
import { getDesignWorks } from "@/lib/data";
import { PageHeader, Section, EmptyState } from "@/components/public/section";
import { DesignGallery } from "@/components/public/design-gallery";

export const metadata = {
  title: "Design Portfolio",
  description:
    "UI/UX, graphic and academic design work by Most. Farheen Islam Badhon - interfaces, dashboards, posters, diagrams and visual systems.",
  alternates: { canonical: "/designs" },
};

export default async function DesignsPage() {
  const works = await getDesignWorks();
  const categories = [...new Set(works.map((work) => work.category))].filter(Boolean);
  const featuredCount = works.filter((work) => work.is_featured).length;

  return (
    <>
      <PageHeader
        eyebrow="Creative practice"
        title="Design portfolio"
        description="A visual gallery of interface design, graphic work and academic visualisations - built with Figma, Adobe XD, Photopea, Canva and Draw.io."
      >
        {works.length > 0 && (
          <p className="mt-4 text-[12.5px] text-muted-foreground">
            {works.length} {works.length === 1 ? "piece" : "pieces"} across {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"} · {featuredCount} featured
          </p>
        )}
      </PageHeader>

      <Section>
        {works.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="The gallery is ready for your first design"
            description="This gallery is fully database-driven. Add UI/UX, graphic or academic design work from Admin → Design portfolio, and it appears here with category filters, search and a full-screen preview."
          />
        ) : (
          <DesignGallery works={works} categories={categories} />
        )}
      </Section>
    </>
  );
}
