"use client";

import { useEffect, useRef, useState } from "react";

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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-px w-full" aria-hidden />
      <header
        data-review="utility"
        className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "border-border bg-background/98 shadow-lg shadow-black/30 backdrop-blur-lg"
            : "border-border/70 bg-background/88 backdrop-blur-md"
        }`}
      >
        <div className="hazard-edge h-1 w-full" aria-hidden />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 md:gap-4 md:px-10">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold uppercase tracking-wide text-foreground md:text-lg">
              {businessName}
            </p>
            <p className="mt-0.5 min-h-5 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-muted-fg md:text-xs">
              {trade}
              <span className="mx-1.5 text-border">/</span>
              {area}
              <span className="mx-1.5 text-border">/</span>
              {rating}★ / {reviewCount} reviews
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={quoteHref}
              className="btn-primary focus-ring whitespace-nowrap px-4 py-2.5 text-xs md:px-5 md:text-sm"
            >
              Get a free quote
            </a>
            <a
              href={phoneHref}
              className="btn-secondary focus-ring whitespace-nowrap px-4 py-2.5 text-xs md:px-5 md:text-sm"
            >
              Call {ownerName} - {phone}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
