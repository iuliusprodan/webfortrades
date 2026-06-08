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
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const callLabel = scrolled ? phone : `Call ${ownerName} - ${phone}`;
  const quoteLabel = scrolled ? "Get a quote" : "Get a free quote";

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-px w-full" aria-hidden />
      <header
        data-review="utility"
        data-scrolled={scrolled ? "true" : "false"}
        className={`sticky-header sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ease-in-out ${
          scrolled
            ? "border-border bg-surface/95 shadow-sm backdrop-blur-lg"
            : "border-border/70 bg-surface/80 backdrop-blur-md"
        }`}
      >
        <div
          className={`sticky-header-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 md:gap-4 md:px-10 ${
            scrolled ? "py-2.5" : "py-3"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`sticky-header-title font-display font-semibold text-foreground transition-[font-size,line-height] duration-300 ease-in-out ${
                scrolled ? "text-base md:text-base" : "text-lg md:text-xl"
              }`}
            >
              {businessName}
            </p>
            <p
              className={`sticky-header-meta hidden truncate text-muted-fg transition-[max-height,opacity,margin] duration-300 ease-in-out md:block ${
                scrolled
                  ? "max-h-0 opacity-0"
                  : "mt-0.5 max-h-8 text-xs opacity-100 md:text-sm"
              }`}
            >
              {trade}
              <span className="mx-1.5 text-border">·</span>
              {area}
              <span className="mx-1.5 text-border">·</span>
              {rating}★ · {reviewCount} reviews
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <a
              href={quoteHref}
              className={`btn-primary focus-ring whitespace-nowrap transition-[padding,font-size] duration-300 ease-in-out ${
                scrolled ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm md:px-5 md:text-base"
              }`}
            >
              {quoteLabel}
            </a>
            <a
              href={phoneHref}
              className={`btn-secondary focus-ring whitespace-nowrap transition-[padding,font-size] duration-300 ease-in-out ${
                scrolled ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm md:px-5 md:text-base"
              }`}
            >
              {callLabel}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
