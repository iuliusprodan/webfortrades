"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
      );
      reveals.forEach((el) => observer.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }

    const mobileCta = document.getElementById("mobile-cta");
    const footer = document.getElementById("footer");
    const hero = document.getElementById("top");
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    if (!mobileCta || !footer || !hero || !mobile) return;

    document.body.classList.add("has-mobile-cta");

    function updateMobileCta() {
      const heroBottom = hero!.getBoundingClientRect().bottom;
      const footerTop = footer!.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight * 0.5;
      mobileCta!.classList.toggle("is-visible", show);
      mobileCta!.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", updateMobileCta, { passive: true });
    window.addEventListener("resize", updateMobileCta, { passive: true });
    updateMobileCta();

    return () => {
      window.removeEventListener("scroll", updateMobileCta);
      window.removeEventListener("resize", updateMobileCta);
      document.body.classList.remove("has-mobile-cta");
    };
  }, []);

  return null;
}
