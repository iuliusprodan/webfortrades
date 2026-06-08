"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="py-1">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="focus-ring flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-lg font-bold uppercase tracking-wide md:text-xl">
                {item.q}
              </span>
              <span
                className={`faq-chevron shrink-0 font-mono text-muted-fg transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            <div
              className={`faq-panel grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "faq-panel-open" : "faq-panel-closed"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-5 text-muted-fg">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
