import "./globals.css";
import type { Metadata } from "next";
import { Newsreader, Mulish } from "next/font/google";
import siteMeta from "@/data/site-metadata.json";
import brief from "@/data/brief.json";
import { BUILD_MARKER_BUILD_ID, BUILD_MARKER_SLUG } from "@/lib/build-marker";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
const body = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
  ? [{ url: meta.ogImage, width: 1200, height: 630, alt: `${brief.business_name}, Coatbridge` }]
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
    "@type": "HomeAndConstructionBusiness",
    name: brief.business_name,
    description: meta.description,
    telephone: brief.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Coatbridge",
      addressRegion: "North Lanarkshire",
      postalCode: "ML5",
      addressCountry: "GB",
    },
    areaServed: [
      "Coatbridge",
      "Airdrie",
      "Bargeddie",
      "Bellshill",
      "Baillieston",
      "Glasgow east end",
      "North Lanarkshire",
    ],
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
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
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
