"use client";

import { useEffect } from "react";
import { DEFAULT_B2B_LANDING_CSS, DEFAULT_B2B_LANDING_BODY } from "@/lib/b2b-landing";

export default function B2BLandingPage({ css, body }) {
  const landingCss = css || DEFAULT_B2B_LANDING_CSS;
  const landingBody = body || DEFAULT_B2B_LANDING_BODY;
  useEffect(() => {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-menu a");
    const onToggle = () => {
      if (!mobileMenu) return;
      const open = mobileMenu.classList.toggle("open");
      menuToggle?.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
      menuToggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    };
    const onClose = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
      menuToggle.innerHTML = '<i class="bi bi-list"></i>';
    };
    menuToggle?.addEventListener("click", onToggle);
    mobileLinks.forEach((link) => link.addEventListener("click", onClose));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));

    const heroSlider = document.getElementById("heroSlider");
    const heroSlides = document.querySelectorAll(".hero-slide");
    const heroDots = document.querySelectorAll(".hero-dot");
    const heroPrev = document.getElementById("heroPrev");
    const heroNext = document.getElementById("heroNext");
    let heroCurrent = 0;
    let heroAutoplay = null;
    let touchX = 0;

    function heroGo(index) {
      heroCurrent = (index + heroSlides.length) % heroSlides.length;
      if (heroSlider) heroSlider.style.transform = `translateX(-${heroCurrent * 100}%)`;
      heroDots.forEach((d, i) => d.classList.toggle("active", i === heroCurrent));
    }
    function heroStop() { if (heroAutoplay) clearInterval(heroAutoplay); }
    function heroStart() { heroStop(); heroAutoplay = setInterval(() => heroGo(heroCurrent + 1), 5500); }

    const prevHandler = () => heroGo(heroCurrent - 1);
    const nextHandler = () => heroGo(heroCurrent + 1);
    const dotHandlers = Array.from(heroDots).map((dot, i) => () => heroGo(i));

    heroPrev?.addEventListener("click", prevHandler);
    heroNext?.addEventListener("click", nextHandler);
    heroDots.forEach((dot, i) => dot.addEventListener("click", dotHandlers[i]));

    const touchStart = (e) => { touchX = e.touches[0].clientX; heroStop(); };
    const touchEnd = (e) => {
      const diff = e.changedTouches[0].clientX - touchX;
      if (diff < -40) heroGo(heroCurrent + 1);
      else if (diff > 40) heroGo(heroCurrent - 1);
      heroStart();
    };
    const mouseEnter = () => heroStop();
    const mouseLeave = () => heroStart();

    if (heroSlider) {
      heroSlider.addEventListener("touchstart", touchStart, { passive: true });
      heroSlider.addEventListener("touchend", touchEnd, { passive: true });
      heroSlider.addEventListener("mouseenter", mouseEnter);
      heroSlider.addEventListener("mouseleave", mouseLeave);
    }
    heroGo(0);
    heroStart();

    return () => {
      menuToggle?.removeEventListener("click", onToggle);
      mobileLinks.forEach((link) => link.removeEventListener("click", onClose));
      observer.disconnect();
      heroStop();
      heroPrev?.removeEventListener("click", prevHandler);
      heroNext?.removeEventListener("click", nextHandler);
      heroDots.forEach((dot, i) => dot.removeEventListener("click", dotHandlers[i]));
      if (heroSlider) {
        heroSlider.removeEventListener("touchstart", touchStart);
        heroSlider.removeEventListener("touchend", touchEnd);
        heroSlider.removeEventListener("mouseenter", mouseEnter);
        heroSlider.removeEventListener("mouseleave", mouseLeave);
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingCss }} />
      <div dangerouslySetInnerHTML={{ __html: landingBody }} />
    </>
  );
}
