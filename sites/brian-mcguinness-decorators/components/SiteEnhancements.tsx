"use client";

import { useEffect } from "react";

export function SiteEnhancements() {
  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const mobileNav = document.getElementById("nav-mobile");
    const scrim = document.getElementById("nav-scrim");
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.querySelector<HTMLElement>('[data-section-id="hero"]');
    const footer = document.querySelector<HTMLElement>(".site-footer");
    const quoteBar = document.getElementById("mobile-quote-bar");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- Mobile overlay nav (no layout shift) ----------
    let lastFocus: HTMLElement | null = null;

    function isNavOpen(): boolean {
      return !!mobileNav?.classList.contains("is-open");
    }
    function openNav(): void {
      if (!mobileNav) return;
      lastFocus = document.activeElement as HTMLElement;
      mobileNav.classList.add("is-open");
      scrim?.classList.add("is-open");
      header?.classList.add("is-hidden");
      document.body.style.overflow = "hidden";
      toggle?.setAttribute("aria-expanded", "true");
      toggle?.setAttribute("aria-label", "Close menu");
      mobileNav.querySelector<HTMLElement>(".nav-close, a")?.focus();
      document.addEventListener("keydown", onKey);
    }
    function closeNav(): void {
      if (!mobileNav) return;
      mobileNav.classList.remove("is-open");
      scrim?.classList.remove("is-open");
      header?.classList.remove("is-hidden");
      document.body.style.overflow = "";
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute("aria-label", "Open menu");
      document.removeEventListener("keydown", onKey);
      (lastFocus ?? toggle)?.focus();
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        closeNav();
        return;
      }
      if (e.key === "Tab" && mobileNav) {
        const links = Array.from(mobileNav.querySelectorAll<HTMLElement>("a, button"));
        if (!links.length) return;
        const first = links[0]!;
        const last = links[links.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function onToggleClick(): void {
      if (isNavOpen()) closeNav();
      else openNav();
    }

    toggle?.addEventListener("click", onToggleClick);
    scrim?.addEventListener("click", closeNav);
    const navLinks = Array.from(mobileNav?.querySelectorAll("a") ?? []);
    navLinks.forEach((link) => link.addEventListener("click", closeNav));
    const navClose = mobileNav?.querySelector<HTMLButtonElement>(".nav-close");
    navClose?.addEventListener("click", closeNav);

    // ---------- Header scrolled state ----------
    function onScroll(): void {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---------- Scroll reveals ----------
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let revealObserver: IntersectionObserver | undefined;
    if (reduced) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else if (reveals.length) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver!.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach((el) => revealObserver!.observe(el));
    }

    // ---------- Sticky quote bar (fade + slide, mobile only) ----------
    let heroObserver: IntersectionObserver | undefined;
    let footerObserver: IntersectionObserver | undefined;
    if (quoteBar && hero) {
      let pastHero = false;
      let footerNear = false;
      function syncBar(): void {
        const show = pastHero && !footerNear && window.innerWidth < 768;
        quoteBar!.classList.toggle("is-visible", show);
        quoteBar!.setAttribute("aria-hidden", show ? "false" : "true");
      }
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          pastHero = !entry!.isIntersecting;
          syncBar();
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      heroObserver.observe(hero);
      if (footer) {
        footerObserver = new IntersectionObserver(
          ([entry]) => {
            footerNear = entry!.isIntersecting;
            syncBar();
          },
          { threshold: 0, rootMargin: "0px 0px 80px 0px" }
        );
        footerObserver.observe(footer);
      }
      window.addEventListener("resize", syncBar, { passive: true });
    }

    return () => {
      toggle?.removeEventListener("click", onToggleClick);
      scrim?.removeEventListener("click", closeNav);
      navClose?.removeEventListener("click", closeNav);
      navLinks.forEach((link) => link.removeEventListener("click", closeNav));
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      header?.classList.remove("is-hidden");
      window.removeEventListener("scroll", onScroll);
      revealObserver?.disconnect();
      heroObserver?.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  return null;
}
