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

    const stickyBar = document.getElementById("sticky-call");
    const hero = document.getElementById("hero");
    const footer = document.getElementById("footer");
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    if (!stickyBar || !hero || !footer || !mobile) return;

    document.body.classList.add("has-sticky");

    function updateStickyBar() {
      const heroBottom = hero!.getBoundingClientRect().bottom;
      const footerTop = footer!.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;
      stickyBar!.classList.toggle("is-visible", show);
      stickyBar!.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", updateStickyBar, { passive: true });
    updateStickyBar();

    return () => {
      window.removeEventListener("scroll", updateStickyBar);
      document.body.classList.remove("has-sticky");
    };
  }, []);

  return null;
}
