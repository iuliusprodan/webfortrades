"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");

    if (toggle && mobileNav) {
      const onToggle = () => {
        const open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      toggle.addEventListener("click", onToggle);

      const links = mobileNav.querySelectorAll("a");
      const closeNav = () => {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      };
      links.forEach((link) => link.addEventListener("click", closeNav));

      return () => {
        toggle.removeEventListener("click", onToggle);
        links.forEach((link) => link.removeEventListener("click", closeNav));
      };
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }

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
  }, []);

  useEffect(() => {
    const sticky = document.getElementById("mobile-sticky");
    const hero = document.querySelector<HTMLElement>(".hero");
    const footer = document.querySelector<HTMLElement>(".site-footer");

    if (!sticky || !hero || !footer) return;

    function updateSticky() {
      const heroBottom = hero!.getBoundingClientRect().bottom;
      const footerTop = footer!.getBoundingClientRect().top;
      const show = heroBottom < 0 && footerTop > window.innerHeight;
      sticky!.classList.toggle("is-visible", show);
      document.body.classList.toggle("has-mobile-sticky", show);
    }

    window.addEventListener("scroll", updateSticky, { passive: true });
    window.addEventListener("resize", updateSticky, { passive: true });
    updateSticky();

    return () => {
      window.removeEventListener("scroll", updateSticky);
      window.removeEventListener("resize", updateSticky);
      document.body.classList.remove("has-mobile-sticky");
    };
  }, []);

  return null;
}
