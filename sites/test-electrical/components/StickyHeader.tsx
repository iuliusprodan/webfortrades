"use client";

import { useEffect, useState } from "react";

interface StickyHeaderProps {
  businessName: string;
  trade: string;
  area: string;
  rating: number;
  reviewCount: number;
  phone: string;
  phoneHref: string;
  ownerName: string;
  quoteHref?: string;
}

export function StickyHeader({
  businessName,
  trade,
  area,
  rating,
  reviewCount,
  phone,
  phoneHref,
  ownerName,
  quoteHref = "#contact",
}: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const callLabel = scrolled
    ? phone
    : `Call ${ownerName} - ${phone}`;

  const quoteLabel = scrolled ? "Get a quote" : "Get a free quote";

  return (
    <header
      data-review="utility"
      className={`sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 transition-all duration-300 md:gap-4 md:px-10 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`font-display font-semibold text-foreground transition-all duration-300 ${
              scrolled ? "text-base" : "text-lg md:text-xl"
            }`}
          >
            {businessName}
          </p>
          <p
            className={`truncate text-muted-fg transition-all duration-300 ${
              scrolled
                ? "max-h-0 overflow-hidden opacity-0"
                : "mt-0.5 max-h-8 text-xs md:text-sm"
            }`}
          >
            {trade}
            <span className="mx-1.5 text-border">·</span>
            {area}
            <span className="mx-1.5 text-border">·</span>
            {rating}★ · {reviewCount} reviews
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={quoteHref}
            className={`btn-primary focus-ring whitespace-nowrap ${
              scrolled ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm md:px-5 md:text-base"
            }`}
          >
            {quoteLabel}
          </a>
          <a
            href={phoneHref}
            className={`btn-secondary focus-ring whitespace-nowrap ${
              scrolled ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm md:px-5 md:text-base"
            }`}
          >
            {callLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
