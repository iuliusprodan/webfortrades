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

    const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const mobileNav = document.getElementById("mobile-menu");

    function closeMobileNav() {
      mobileNav?.classList.remove("is-open");
      mobileNav?.setAttribute("hidden", "");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Open menu");
    }

    function onMenuToggle() {
      if (!menuToggle || !mobileNav) return;
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.classList.toggle("is-open", open);
      if (open) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
    }

    menuToggle?.addEventListener("click", onMenuToggle);
    mobileNav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    const stickyBar = document.getElementById("sticky-call");
    const hero = document.querySelector<HTMLElement>('[data-section-id="hero"]');
    const footer = document.getElementById("footer");
    const mobile = window.matchMedia("(max-width: 920px)").matches;

    function updateStickyBar() {
      if (!stickyBar || !hero || !footer) return;

      if (!mobile && window.innerWidth >= 920) {
        stickyBar.classList.remove("is-visible");
        stickyBar.setAttribute("aria-hidden", "true");
        document.body.classList.remove("has-sticky");
        return;
      }

      document.body.classList.add("has-sticky");
      const heroBottom = hero.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;
      stickyBar.classList.toggle("is-visible", show);
      stickyBar.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", updateStickyBar, { passive: true });
    window.addEventListener("resize", updateStickyBar);
    updateStickyBar();

    return () => {
      window.removeEventListener("scroll", updateStickyBar);
      window.removeEventListener("resize", updateStickyBar);
      menuToggle?.removeEventListener("click", onMenuToggle);
      document.body.classList.remove("has-sticky");
    };
  }, []);

  return null;
}
