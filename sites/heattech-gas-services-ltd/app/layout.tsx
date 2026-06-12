import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import siteMeta from "@/data/site-metadata.json";
import brief from "@/data/brief.json";
import { BUILD_MARKER_BUILD_ID, BUILD_MARKER_SLUG } from "@/lib/build-marker";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
});

const meta = siteMeta as {
  title: string;
  description: string;
  ogImage: string | null;
  metadataBase: string;
  buildId: string;
  webfortradesSlug: string;
};

const ogImages = meta.ogImage
  ? [{ url: meta.ogImage, width: 1200, height: 630, alt: `${brief.business_name}, Edinburgh` }]
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
  const rating = typeof brief.google_rating === "number" ? brief.google_rating : null;
  const reviewCount =
    brief.google_review_count_sourced && typeof brief.google_review_count === "number"
      ? brief.google_review_count
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brief.business_name,
    telephone: brief.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Edinburgh",
      postalCode: "EH15 3FD",
      addressCountry: "GB",
    },
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={dmSans.variable}>
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
