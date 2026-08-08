export const B2B_MOBILE_CSS = `
  @media (max-width: 768px) {
    html { overflow-x: hidden; }
    body { width: 100%; overflow-x: hidden; }
    .container { width: 100%; padding-left: 1rem; padding-right: 1rem; }
    .site-header { position: sticky; top: 0; z-index: 1000; }
    .main-nav { min-height: 60px; position: relative; gap: .75rem; }
    .logo { min-width: 0; max-width: 72%; }
    .logo img { width: auto; max-width: 100%; height: auto; max-height: 38px; }
    .menu-toggle { flex-shrink: 0; padding: .5rem; }
    .nav-links { z-index: 1001; width: calc(100vw - 2rem); max-height: calc(100vh - 72px); margin: 0 1rem; left: 0; right: 0; top: 100%; overflow-y: auto; border-radius: 0 0 16px 16px; padding: .75rem; gap: .25rem; }
    .nav-links a { display: block; padding: .75rem; font-size: .88rem; }
    .hero, .hero-slide { min-height: 0; }
    .hero-slide { padding: 2.5rem 0 4rem; }
    .hero-slide .container, .seller-card, .coverage-layout, .ego-grid, .lead-grid, .footer-layout { grid-template-columns: 1fr; }
    .hero-content { width: 100%; max-width: none; text-align: center; }
    .hero-content h1 { font-size: clamp(1.75rem, 8vw, 2.35rem); overflow-wrap: anywhere; }
    .hero-content h1 span { font-size: clamp(2rem, 10vw, 2.8rem); }
    .hero-content p { font-size: .98rem; }
    .hero-ctas { align-items: stretch; flex-direction: column; width: 100%; }
    .hero-ctas .btn { width: 100%; }
    .hero-image-container { width: 100%; }
    .hero-card { width: 100%; max-width: none; padding: 1.25rem; }
    .hero-card-title, .hero-card-subtitle, .hero-card-price-sub { overflow-wrap: anywhere; }
    .section-header, .ego-content, .coverage-info, .lead-content { margin-bottom: 2rem; }
    .section-header h2, .ego-content h2, .coverage-info h2, .lead-content h2 { font-size: clamp(1.65rem, 7vw, 2.2rem); overflow-wrap: anywhere; }
    .plan-card, .coverage-card, .lead-card { padding: 1.25rem; }
    .ego-image img { min-height: 240px; max-height: 320px; }
    .ego-list li, .footer-contact li { min-width: 0; }
    .ego-list li span, .footer-contact li span { overflow-wrap: anywhere; }
    .footer-about img { max-width: 100%; height: auto; }
    .footer-bottom { overflow-wrap: anywhere; }
    .btn { max-width: 100%; }
  }

  @media (max-width: 480px) {
    .hero-slide { padding-top: 2rem; }
    .hero-card { border-radius: 16px; }
    .hero-carousel-controls { left: 1rem; right: 1rem; justify-content: center; }
    .marquee-item { max-width: 86vw; overflow: hidden; text-overflow: ellipsis; }
  }
`;
