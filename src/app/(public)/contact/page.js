import { Mail, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { getProfile, getSiteSettings } from "@/lib/data";
import { PageHeader, Section } from "@/components/public/section";
import { ContactForm } from "@/components/public/contact-form";
import { ButtonLink } from "@/components/ui/button";

export const metadata = {
  title: "Contact",
  description:
    "Contact Most. Farheen Islam Badhon for research collaboration, research assistant opportunities, funded graduate study or remote work.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);

  const channels = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "farheen-islam-badhon",
      href: profile.linkedin_url,
    },
    { icon: Github, label: "GitHub", value: "FarheenIslam", href: profile.github_url },
    { icon: MapPin, label: "Location", value: profile.location, href: null },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's talk" description={settings.contact_intro} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="space-y-4">
            {channels.map((channel) => (
              <div
                key={channel.label}
                className="surface flex items-start gap-3.5 p-5"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <channel.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {channel.label}
                  </p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer noopener"
                      className="mt-0.5 block break-words text-[14px] font-medium hover:text-accent"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-[14px] font-medium">{channel.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-muted/40 p-5">
              <p className="flex items-center gap-2 text-[13px] font-medium">
                <Clock className="size-4 text-accent" /> Response time
              </p>
              <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                I usually reply within a few days. For academic or research enquiries, please
                include your institution and a short description of the opportunity.
              </p>
              <p className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
                Messages are stored privately in Supabase and are only visible to the site
                administrators. No home address or private contact details are published.
              </p>
            </div>

            <ButtonLink href="/api/portfolio-pdf" variant="outline" className="w-full">
              Download the PDF portfolio
            </ButtonLink>
          </div>

          <div className="surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Send a message</h2>
            <p className="mb-6 mt-1.5 text-[13.5px] text-muted-foreground">
              All fields marked required help me reply properly.
            </p>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
