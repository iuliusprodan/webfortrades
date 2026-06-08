import type { Metadata } from "next";
import {
  DM_Sans,
  Fraunces,
  IBM_Plex_Sans,
  Space_Mono,
  Syne,
  Work_Sans,
} from "next/font/google";
import design from "@/data/design-system.json";
import { brief } from "@/lib/data";
import type { DesignSystem } from "@/lib/types";
import "./globals.css";

const ds = design as DesignSystem;

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

const description = `${brief.services.slice(0, 3).join(", ")} in ${brief.service_area[0] ?? "your area"}. Call ${brief.phone ?? brief.business_name}.`;

export const metadata: Metadata = {
  title: `${brief.business_name} — ${brief.services[0] ?? "Local trade"}`,
  description,
  openGraph: {
    title: brief.business_name,
    description,
    type: "website",
    images: brief.photos[0]
      ? [{ url: `/${brief.photos[0].local.replace(/^images\//, "images/")}` }]
      : undefined,
  },
};

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brief.business_name,
    telephone: brief.phone ?? undefined,
    email: brief.email ?? undefined,
    address: brief.address || undefined,
    areaServed: brief.service_area,
    image: brief.photos.map((p) => `/${p.local.replace(/^images\//, "images/")}`),
    aggregateRating: brief.reviews.length
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            brief.reviews.reduce((a, r) => a + r.rating, 0) / brief.reviews.length
          ).toFixed(1),
          reviewCount: brief.reviews.length,
        }
      : undefined,
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
