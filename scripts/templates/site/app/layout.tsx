import "./globals.css";
import type { Metadata } from "next";
import siteMeta from "@/data/site-metadata.json";
import design from "@/data/design-system.json";
import { brief, googleRatingSourced, googleReviewCountSourced } from "@/lib/data";
import type { DesignSystem } from "@/lib/types";
import {
  Archivo,
  DM_Sans,
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  Lora,
  Manrope,
  Merriweather,
  Source_Serif_4,
  Space_Grotesk,
  Space_Mono,
  Syne,
  Work_Sans,
} from "next/font/google";
import {
  BUILD_MARKER_BUILD_ID,
  BUILD_MARKER_SLUG,
} from "@/lib/build-marker";

const ds = design as DesignSystem;
const meta = siteMeta as {
  title: string;
  description: string;
  ogImage: string | null;
  metadataBase: string;
  buildId: string;
  webfortradesSlug: string;
};

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const lora = Lora({ subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-display" });
const ibmPlex = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-body" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const fontVars: Record<string, string> = {
  "inter-fraunces": `${fraunces.variable} ${inter.variable}`,
  "space-grotesk-inter": `${spaceGrotesk.variable} ${inter.variable}`,
  "dm-sans-lora": `${lora.variable} ${dmSans.variable}`,
  "archivo-ibm-plex": `${archivo.variable} ${ibmPlex.variable}`,
  "manrope-source-serif": `${sourceSerif.variable} ${manrope.variable}`,
  "work-sans-merriweather": `${merriweather.variable} ${workSans.variable}`,
  "syne-dm-sans": `${syne.variable} ${dmSans.variable}`,
  "space-mono-ibm-plex": `${spaceMono.variable} ${ibmPlex.variable}`,
  "warm-heating-legacy": `${fraunces.variable} ${workSans.variable}`,
  "industrial-mechanic-legacy": `${spaceMono.variable} ${ibmPlex.variable}`,
};

function fontClasses(): string {
  const key = ds.fontPairKey;
  if (key && fontVars[key]) return fontVars[key];
  if (ds.trade === "industrial-mechanic") return fontVars["industrial-mechanic-legacy"]!;
  if (ds.trade === "warm-heating") return fontVars["warm-heating-legacy"]!;
  return fontVars["syne-dm-sans"]!;
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
        <meta name={BUILD_MARKER_BUILD_ID} content={meta.buildId} />
        <meta name={BUILD_MARKER_SLUG} content={meta.webfortradesSlug} />
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
