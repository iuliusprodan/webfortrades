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

    const update = () => {
      const rect = footer.getBoundingClientRect();
      setFooterVisible(rect.top < window.innerHeight - 72);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFooterVisible(true);
        else update();
      },
      { threshold: 0, rootMargin: "0px 0px -72px 0px" }
    );

    observer.observe(footer);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
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
