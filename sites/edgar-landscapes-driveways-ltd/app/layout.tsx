import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans } from "next/font/google";
import siteMeta from "@/data/site-metadata.json";
import brief from "@/data/brief.json";
import { BUILD_MARKER_BUILD_ID, BUILD_MARKER_SLUG } from "@/lib/build-marker";

const display = DM_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Segoe UI", "Helvetica Neue", "system-ui", "sans-serif"],
});

const meta = siteMeta as {
  title: string;
  description: string;
  ogImage: string | null;
  metadataBase: string;
  buildId: string;
  webfortradesSlug: string;
};

export const metadata: Metadata = {
  metadataBase: new URL(meta.metadataBase),
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: "website",
    url: meta.metadataBase,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

function publicLocationFromAddress(address: string | null | undefined): {
  locality: string;
  postalCode: string;
} | null {
  if (!address) return null;
  const match = address.match(/,\s*([A-Za-z][A-Za-z\s']*?)\s+([A-Z]{1,2}\d[\dA-Z]?\s*\d[A-Z]{2})/i);
  if (!match) return null;
  return { locality: match[1].trim(), postalCode: match[2].trim().toUpperCase() };
}

function localBusinessJsonLd() {
  const rating = typeof brief.google_rating === "number" ? brief.google_rating : null;
  const reviewCount =
    brief.google_review_count_sourced && typeof brief.google_review_count === "number"
      ? brief.google_review_count
      : null;
  const publicLocation = publicLocationFromAddress(brief.address ?? null);

  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: brief.business_name,
    telephone: brief.phone ?? undefined,
    email: brief.email ?? undefined,
    ...(publicLocation
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: publicLocation.locality,
            postalCode: publicLocation.postalCode,
            addressCountry: "GB",
          },
        }
      : {}),
    areaServed: brief.service_area,
    url: meta.metadataBase,
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB" className={display.variable}>
      <head>
        <meta name={BUILD_MARKER_BUILD_ID} content={meta.buildId} />
        <meta name={BUILD_MARKER_SLUG} content={meta.webfortradesSlug} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
