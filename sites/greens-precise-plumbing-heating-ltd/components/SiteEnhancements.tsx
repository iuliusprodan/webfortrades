"use client";

import { useEffect } from "react";

// Sticky header shadow, scroll-reveal, mobile CTA bar after hero, hide bar near footer.
export function SiteEnhancements() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    const hero = document.querySelector<HTMLElement>(".hero");
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const mobileBar = document.querySelector<HTMLElement>(".mobile-call-bar");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onScroll() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }

    let revealObserver: IntersectionObserver | undefined;
    if (!reduced) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver!.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach((el) => revealObserver!.observe(el));
    }

    let heroObserver: IntersectionObserver | undefined;
    let footerObserver: IntersectionObserver | undefined;

    if (mobileBar && hero) {
      let pastHero = false;
      let footerNear = false;

      function syncMobileBar() {
        mobileBar!.classList.toggle("is-visible", pastHero && !footerNear);
        document.body.classList.toggle("has-mobile-bar-active", pastHero && !footerNear);
      }

      heroObserver = new IntersectionObserver(
        ([entry]) => {
          pastHero = !entry.isIntersecting;
          syncMobileBar();
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      heroObserver.observe(hero);

      if (footer) {
        footerObserver = new IntersectionObserver(
          ([entry]) => {
            footerNear = entry.isIntersecting;
            syncMobileBar();
          },
          { threshold: 0, rootMargin: "0px 0px 80px 0px" }
        );
        footerObserver.observe(footer);
      }
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver?.disconnect();
      heroObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  return null;
}
