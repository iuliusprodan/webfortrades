import type { Metadata } from "next";
import siteMeta from "@/data/site-metadata.json";
import design from "@/data/design-system.json";
import { brief, googleRatingSourced, googleReviewCountSourced } from "@/lib/data";
import type { DesignSystem } from "@/lib/types";
import {
  DM_Sans,
  Fraunces,
  IBM_Plex_Sans,
  Space_Mono,
  Syne,
  Work_Sans,
} from "next/font/google";
import "./globals.css";

const ds = design as DesignSystem;
const meta = siteMeta as {
  title: string;
  description: string;
  ogImage: string | null;
  metadataBase: string;
};

const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-body" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});
const ibmPlex = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

function fontClasses(): string {
  if (ds.trade === "industrial-mechanic") {
    return `${spaceMono.variable} ${ibmPlex.variable}`;
  }
  if (ds.trade === "warm-heating") {
    return `${fraunces.variable} ${workSans.variable}`;
  }
  return `${syne.variable} ${dmSans.variable}`;
}

const ogImages = meta.ogImage
  ? [{ url: meta.ogImage, width: 1200, height: 630, alt: `${brief.business_name} website preview` }]
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(meta.metadataBase),
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: "website",
    url: meta.metadataBase,
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: meta.ogImage ? [meta.ogImage] : undefined,
  },
};

function localBusinessJsonLd() {
  const rating = googleRatingSourced();
  const reviewCount = googleReviewCountSourced();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brief.business_name,
    telephone: brief.phone ?? undefined,
    email: brief.email ?? undefined,
    address: brief.address || undefined,
    areaServed: brief.service_area,
    ...(rating !== null && reviewCount !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(rating),
            reviewCount: String(reviewCount),
          },
        }
      : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const c = ds.colors;
  return (
    <html lang="en-GB">
      <head>
        <style>{`:root {
          --color-accent: ${c.accent};
          --color-accent-fg: ${c.accentForeground};
          --color-background: ${c.background};
          --color-foreground: ${c.foreground};
          --color-muted: ${c.muted};
          --color-muted-fg: ${c.mutedForeground};
          --color-border: ${c.border};
          --color-surface: ${c.surface};
        }`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </head>
      <body className={`${fontClasses()} [--font-mono:var(--font-display)]`}>
        {children}
      </body>
    </html>
  );
}
