"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reducedMotion) {
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
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  useEffect(() => {
    const callBar = document.getElementById("call-bar");
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const hero = document.querySelector<HTMLElement>(".hero");

    if (!callBar || !hero || !footer) return;

    let ticking = false;

    function updateCallBar() {
      if (window.innerWidth >= 768) {
        callBar!.classList.remove("is-visible", "is-hidden");
        callBar!.setAttribute("aria-hidden", "true");
        return;
      }

      const heroBottom = hero!.getBoundingClientRect().bottom;
      const footerTop = footer!.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;

      if (heroBottom < 0 && footerTop > viewportHeight) {
        callBar!.classList.add("is-visible");
        callBar!.classList.remove("is-hidden");
        callBar!.setAttribute("aria-hidden", "false");
      } else if (footerTop <= viewportHeight) {
        callBar!.classList.remove("is-visible");
        callBar!.classList.add("is-hidden");
        callBar!.setAttribute("aria-hidden", "true");
      } else {
        callBar!.classList.remove("is-visible", "is-hidden");
        callBar!.setAttribute("aria-hidden", "true");
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateCallBar();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateCallBar);
    updateCallBar();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateCallBar);
    };
  }, []);

  return null;
}
