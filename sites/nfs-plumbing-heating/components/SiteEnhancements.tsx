"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".fade-in"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => revealObs.observe(el));
    }

    const header = document.getElementById("site-header");
    function onScroll() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const hero = document.getElementById("hero");
    const footer = document.getElementById("footer");
    const sticky = document.getElementById("mobile-sticky");

    if (!hero || !footer || !sticky) {
      return () => window.removeEventListener("scroll", onScroll);
    }

    let heroVisible = true;
    let footerVisible = false;

    function updateSticky() {
      const visible = !heroVisible && !footerVisible;
      sticky!.classList.toggle("is-visible", visible);
      document.body.classList.toggle("has-mobile-sticky", visible);
    }

    const heroObs = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry!.isIntersecting;
        updateSticky();
      },
      { threshold: 0 }
    );
    heroObs.observe(hero);

    const footerObs = new IntersectionObserver(
      ([entry]) => {
        footerVisible = entry!.isIntersecting;
        updateSticky();
      },
      { threshold: 0 }
    );
    footerObs.observe(footer);

    return () => {
      window.removeEventListener("scroll", onScroll);
      heroObs.disconnect();
      footerObs.disconnect();
      document.body.classList.remove("has-mobile-sticky");
    };
  }, []);

  return null;
}
