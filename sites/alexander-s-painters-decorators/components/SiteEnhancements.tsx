"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else if ("IntersectionObserver" in window) {
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
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }

    const bar = document.getElementById("mobile-cta");
    const hero = document.querySelector<HTMLElement>(".hero");
    const footer = document.querySelector<HTMLElement>(".site-footer");

    if (!bar || !hero || !footer) return;

    function updateBar() {
      const heroBottom = hero!.getBoundingClientRect().bottom;
      const footerTop = footer!.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;
      bar!.classList.toggle("is-visible", show);
      bar!.classList.toggle("is-hidden", !show);
      document.body.classList.toggle("has-mobile-cta", show);
    }

    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar, { passive: true });
    updateBar();

    return () => {
      window.removeEventListener("scroll", updateBar);
      window.removeEventListener("resize", updateBar);
      document.body.classList.remove("has-mobile-cta");
    };
  }, []);

  return null;
}
