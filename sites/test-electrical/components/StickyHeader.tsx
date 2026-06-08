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
}: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-review="utility"
      className={`sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 transition-all duration-300 md:px-10 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <div className="min-w-0">
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
        <a
          href={phoneHref}
          className={`btn-primary focus-ring shrink-0 whitespace-nowrap ${
            scrolled ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm md:text-base"
          }`}
        >
          {scrolled ? phone : `Call ${ownerName}, ${phone}`}
        </a>
      </div>
    </header>
  );
}
