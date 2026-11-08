import { Inter, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Most. Farheen Islam Badhon — Computer Science & Engineering Portfolio",
    template: "%s · Most. Farheen Islam Badhon",
  },
  description:
    "Portfolio of Most. Farheen Islam Badhon, Computer Science and Engineering undergraduate at IUBAT, Bangladesh — software projects, research in AI and deepfake detection, certificates and design work.",
  keywords: [
    "Farheen Islam Badhon",
    "IUBAT",
    "Computer Science",
    "Deepfake Detection",
    "Machine Learning",
    "UI/UX Design",
    "Portfolio",
    "Bangladesh",
  ],
  authors: [{ name: "Most. Farheen Islam Badhon" }],
  creator: "Most. Farheen Islam Badhon",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: "Most. Farheen Islam Badhon",
    title: "Most. Farheen Islam Badhon — Computer Science & Engineering Portfolio",
    description:
      "Computer Science and Engineering undergraduate at IUBAT with interests in AI, computer vision and deepfake detection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Most. Farheen Islam Badhon — Portfolio",
    description:
      "Computer Science and Engineering undergraduate at IUBAT with interests in AI, computer vision and deepfake detection.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "!rounded-xl !border !border-border !bg-card !text-foreground !shadow-lift",
                description: "!text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
