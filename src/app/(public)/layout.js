import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { getProfile, getSiteSettings } from "@/lib/data";

export default async function PublicLayout({ children }) {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader name={profile?.full_name} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter profile={profile} settings={settings} />
    </div>
  );
}
