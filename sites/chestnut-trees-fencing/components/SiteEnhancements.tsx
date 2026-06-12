"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
    const mobileNav = document.getElementById("mobile-nav");

    function onNavToggle() {
      if (!toggle || !mobileNav) return;
      const open = toggle.getAttribute("aria-expanded") === "true";
      const nextOpen = !open;
      toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      toggle.setAttribute("aria-label", nextOpen ? "Close menu" : "Open menu");
      mobileNav.classList.toggle("is-open", nextOpen);
      if (nextOpen) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
    }

    toggle?.addEventListener("click", onNavToggle);
    mobileNav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!toggle || !mobileNav) return;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mobileNav.classList.remove("is-open");
        mobileNav.setAttribute("hidden", "");
      });
    });

    const callBar = document.getElementById("mobile-call-bar");
    const hero = document.querySelector<HTMLElement>('[data-section-id="hero"]');
    const footer = document.querySelector<HTMLElement>(".pagefoot");

    function updateCallBar() {
      if (!callBar || !hero || !footer) return;

      if (window.innerWidth >= 920) {
        callBar.classList.remove("is-visible");
        callBar.setAttribute("aria-hidden", "true");
        document.body.classList.remove("has-mobile-bar");
        return;
      }

      document.body.classList.add("has-mobile-bar");
      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;
      callBar.classList.toggle("is-visible", show);
      callBar.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", updateCallBar, { passive: true });
    window.addEventListener("resize", updateCallBar);
    updateCallBar();

    return () => {
      toggle?.removeEventListener("click", onNavToggle);
      window.removeEventListener("scroll", updateCallBar);
      window.removeEventListener("resize", updateCallBar);
      document.body.classList.remove("has-mobile-bar");
    };
  }, []);

  return null;
}
