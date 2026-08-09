export const B2B_HERO_SCRIPT = `
  (() => {
    const init = () => {
      const hero = document.querySelector('.hero#inicio');
      const slider = document.getElementById('heroSlider');
      const slides = slider ? Array.from(slider.querySelectorAll('.hero-slide')) : [];
      const prev = document.getElementById('heroPrev');
      const next = document.getElementById('heroNext');
      const dots = Array.from(document.querySelectorAll('#heroDots .hero-dot'));
      if (!hero || !slider || slides.length === 0 || hero.dataset.carouselReady === 'true') return;

      hero.dataset.carouselReady = 'true';
      let activeIndex = 0;
      const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

      const render = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slider.style.transform = 'translateX(-' + (activeIndex * 100) + '%)';
        slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === activeIndex));
        dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === activeIndex));
      };

      prev?.addEventListener('click', () => render(activeIndex - 1));
      next?.addEventListener('click', () => render(activeIndex + 1));
      dots.forEach((dot, index) => dot.addEventListener('click', () => render(index)));
      render(0);

      if (!isPreview && slides.length > 1) {
        window.setInterval(() => render(activeIndex + 1), 5500);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  })();
`;
