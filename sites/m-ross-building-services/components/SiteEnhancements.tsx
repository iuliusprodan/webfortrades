"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
    const mobileNav = document.getElementById("nav-mobile");

    function onNavToggle() {
      if (!toggle || !mobileNav) return;
      const open = toggle.getAttribute("aria-expanded") === "true";
      const nextOpen = !open;
      toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      mobileNav.classList.toggle("open", nextOpen);
    }

    toggle?.addEventListener("click", onNavToggle);

    const callBar = document.getElementById("mobile-call-bar");
    const hero = document.querySelector<HTMLElement>('[data-section-id="review-led-hero"]');
    const footer = document.querySelector<HTMLElement>(".pagefoot");

    let ticking = false;

    function updateCallBar() {
      if (!callBar || !hero || !footer) return;

      if (window.innerWidth >= 920) {
        callBar.classList.remove("is-visible");
        callBar.setAttribute("aria-hidden", "true");
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;

      callBar.classList.toggle("is-visible", show);
      callBar.setAttribute("aria-hidden", show ? "false" : "true");
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
      toggle?.removeEventListener("click", onNavToggle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateCallBar);
    };
  }, []);

  return null;
}
