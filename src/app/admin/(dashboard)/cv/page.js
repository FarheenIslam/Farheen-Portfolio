import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getPortfolioBundle } from "@/lib/data";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "CV & PDF · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCvPage() {
  await requireAdmin();
  const { profile, projects, publications, certificates, designWorks, achievements } =
    await getPortfolioBundle();

  const included = [
    { label: "Profile & biography", count: 1, href: "/admin/profile" },
    { label: "Projects", count: projects.length, href: "/admin/projects" },
    { label: "Publications", count: publications.length, href: "/admin/publications" },
    { label: "Certificates", count: certificates.length, href: "/admin/certificates" },
    { label: "Achievements", count: achievements.length, href: "/admin/achievements" },
    { label: "Design highlights", count: designWorks.length, href: "/admin/designs" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">CV &amp; PDF portfolio</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
          Both PDFs are generated on demand from the latest published content - there is no separate
          file to keep in sync.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface flex flex-col p-6">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText className="size-5" />
          </span>
          <h3 className="mt-3 text-[15px] font-semibold">Curriculum Vitae (PDF)</h3>
          <p className="mt-1.5 flex-1 text-[12.5px] leading-6 text-muted-foreground">
            A concise one-to-two page CV: profile, education, skills, projects, research and
            activities. Generated at A4 with clickable links.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/api/cv-pdf" size="sm" variant="accent">
              <Download className="size-3.5" /> Download CV
            </ButtonLink>
            <ButtonLink href="/api/cv-pdf" size="sm" variant="outline" target="_blank">
              <ExternalLink className="size-3.5" /> Open in browser
            </ButtonLink>
          </div>
        </div>

        <div className="surface flex flex-col p-6">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText className="size-5" />
          </span>
          <h3 className="mt-3 text-[15px] font-semibold">Portfolio (PDF)</h3>
          <p className="mt-1.5 flex-1 text-[12.5px] leading-6 text-muted-foreground">
            Multi-page A4 portfolio: cover, introduction, about, education, skills, projects,
            research, thesis, certificates, design highlights, experience and contact.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/api/portfolio-pdf" size="sm" variant="accent">
              <Download className="size-3.5" /> Download portfolio
            </ButtonLink>
            <ButtonLink href="/api/portfolio-pdf" size="sm" variant="outline" target="_blank">
              <ExternalLink className="size-3.5" /> Open in browser
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <RefreshCw className="size-4 text-accent" /> Content included
          </h3>
          <ul className="mt-3 divide-y divide-border">
            {included.map((item) => (
              <li key={item.label} className="flex items-center justify-between py-2.5">
                <Link href={item.href} className="text-[12.5px] hover:text-accent">
                  {item.label}
                </Link>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] leading-5 text-muted-foreground">
            Only published items are included. Unpublish anything you do not want in the PDF.
          </p>
        </div>

        <div className="space-y-5">
          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <UploadCloud className="size-4 text-accent" /> Uploaded CV file
            </h3>
            {profile.resume_url ? (
              <>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  A manually uploaded CV is linked from the Résumé page.
                </p>
                <ButtonLink
                  href={profile.resume_url}
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  target="_blank"
                >
                  <ExternalLink className="size-3.5" /> Open uploaded CV
                </ButtonLink>
              </>
            ) : (
              <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
                No file uploaded. The generated PDF CV above is always available; upload a custom file
                from the Profile page if you prefer.
              </p>
            )}
            <ButtonLink href="/admin/profile" size="sm" variant="ghost" className="mt-2 px-0">
              Manage profile &amp; CV upload →
            </ButtonLink>
          </div>

          <div className="surface p-5">
            <h3 className="text-[13.5px] font-semibold">Last content update</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {profile.updated_at ? formatDate(profile.updated_at) : "Unknown"}
            </p>
            <p className="mt-2 text-[11.5px] leading-5 text-muted-foreground">
              PDFs are re-generated on every download, so they always match the site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
