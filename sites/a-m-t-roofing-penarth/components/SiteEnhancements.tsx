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
      mobileNav.classList.toggle("is-open", nextOpen);
      if (nextOpen) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
    }

    toggle?.addEventListener("click", onNavToggle);

    const faqTriggers = Array.from(document.querySelectorAll<HTMLButtonElement>(".faq-trigger"));
    function onFaqClick(event: Event) {
      const btn = event.currentTarget as HTMLButtonElement;
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    }
    faqTriggers.forEach((trigger) => trigger.addEventListener("click", onFaqClick));

    const callBar = document.getElementById("mobile-call-bar");
    const hero = document.querySelector<HTMLElement>('[data-section-id="hero"]');
    const footer = document.querySelector<HTMLElement>(".pagefoot");

    let ticking = false;

    function updateCallBar() {
      if (!callBar || !hero || !footer) return;

      if (window.innerWidth >= 920) {
        callBar.classList.remove("is-visible", "is-hidden");
        callBar.setAttribute("aria-hidden", "true");
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;

      callBar.classList.toggle("is-visible", show);
      callBar.classList.toggle("is-hidden", !show);
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
      faqTriggers.forEach((trigger) => trigger.removeEventListener("click", onFaqClick));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateCallBar);
    };
  }, []);

  return null;
}
