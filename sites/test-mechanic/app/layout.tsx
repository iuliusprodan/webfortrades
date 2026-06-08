import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import design from "@/data/design-system.json";
import { brief } from "@/lib/data";
import type { DesignSystem } from "@/lib/types";
import "./globals.css";

const ds = design as DesignSystem;

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const description = `${brief.trade} in ${brief.service_area[0]}. Diagnostics, brakes, clutches, services at your door. Call ${brief.phone}.`;

export const metadata: Metadata = {
  title: `${brief.business_name} | ${brief.trade}`,
  description,
  openGraph: {
    title: brief.business_name,
    description,
    type: "website",
  },
};

function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: brief.business_name,
    telephone: brief.phone,
    email: brief.email,
    address: brief.address,
    areaServed: brief.service_area,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: brief.rating.toFixed(1),
      reviewCount: brief.review_count,
    },
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
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
