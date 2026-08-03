import type { Metadata } from "next";
import { EB_Garamond, Archivo, Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, siteUrl } from "@/lib/site";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-reading",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(siteUrl()),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  keywords: [
    "essays",
    "literary",
    "writing",
    "notes",
    "quotes",
    "guest writing",
    "writing contests",
  ],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteUrl()}/feed.xml` },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: siteUrl(),
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${archivo.variable} ${bricolage.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-paper text-ink font-ui antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "bg-surface text-ink border-rule",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
