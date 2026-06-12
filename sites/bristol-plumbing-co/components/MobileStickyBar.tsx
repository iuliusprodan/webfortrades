"use client";

import { useEffect, useState } from "react";

interface MobileStickyBarProps {
  quoteLabel: string;
  callLabel: string;
  phoneHref: string;
}

export function MobileStickyBar({
  quoteLabel,
  callLabel,
  phoneHref,
}: MobileStickyBarProps) {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('[data-review="footer"]');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.08, rootMargin: "0px 0px -8px 0px" }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (footerVisible) return null;

  return (
    <div
      data-review="mobile-call"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href="#contact"
          className="focus-ring flex min-h-tap flex-1 items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-medium text-accent-fg"
        >
          {quoteLabel}
        </a>
        <a
          href={phoneHref}
          className="focus-ring flex min-h-tap flex-1 items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-medium"
        >
          {callLabel}
        </a>
      </div>
    </div>
  );
}
