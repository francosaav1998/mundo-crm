const COMPANY_CONFIG = {
  mundo: {
    fontFamily: '"Montserrat", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    logoDarkHeader:
      "https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg",
    logoLightFooter:
      "https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo.svg",
    invertOnDark: false,
  },
  movistar: {
    fontFamily: '"Nunito Sans", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800;900&display=swap",
    logoDarkHeader:
      "https://ww2.movistar.cl/base/img/iconografia-menu/logo-movistar.svg",
    logoLightFooter:
      "https://ww2.movistar.cl/base/img/iconografia-menu/logo-movistar.svg",
    invertOnDark: true,
  },
  claro: {
    fontFamily: '"Source Sans 3", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700;800;900&display=swap",
    logoDarkHeader:
      "https://www.clarochile.cl/portal/cl/recursos_tema_evo/assets/vector/logo-claro-blanco.svg",
    logoLightFooter:
      "https://www.clarochile.cl/portal/cl/recursos_tema_evo/assets/vector/logo-claro-blanco.svg",
    invertOnDark: false,
  },
  vtr: {
    fontFamily: '"Montserrat", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    logoDarkHeader:
      "https://www.vtr.com/content/b2c/2nzYdvWEr8RiGJ4JFpezOM/logo-vtr-small.png",
    logoLightFooter:
      "https://www.vtr.com/content/b2c/2nzYdvWEr8RiGJ4JFpezOM/logo-vtr-small.png",
    invertOnDark: false,
  },
  wom: {
    fontFamily: '"Montserrat", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    logoDarkHeader:
      "https://images.ctfassets.net/vlub6abkwzvo/2ShWjPXcxzlLkgtic62hes/a7c11a86c399b6e6283d0c6ac6e87ca1/Vector__2_.svg",
    logoLightFooter:
      "https://images.ctfassets.net/vlub6abkwzvo/2ShWjPXcxzlLkgtic62hes/a7c11a86c399b6e6283d0c6ac6e87ca1/Vector__2_.svg",
    invertOnDark: false,
  },
  entel: {
    fontFamily: '"Barlow", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&display=swap",
    logoDarkHeader:
      "https://entel.cdn.modyo.com/uploads/2bdf0650-482f-45b7-a340-2d9700e880ea/original/Size_Extra_large_xl_22_.png",
    logoLightFooter:
      "https://entel.cdn.modyo.com/uploads/2bdf0650-482f-45b7-a340-2d9700e880ea/original/Size_Extra_large_xl_22_.png",
    invertOnDark: true,
  },
};

export function getCompanyConfig(slug) {
  return COMPANY_CONFIG[slug] || COMPANY_CONFIG.mundo;
}

export function getCompanyVars(company) {
  const config = getCompanyConfig(company?.slug);
  if (!company) {
    return {
      "--color-primary": "#00748E",
      "--color-primary-dark": "#005A6F",
      "--color-primary-light": "#e0f2f6",
      "--color-secondary": "#FDDC02",
      "--color-secondary-dark": "#e5c600",
      "--color-accent": "#FF8000",
      "--color-accent-hover": "#e07000",
      "--company-font-family": config.fontFamily,
    };
  }

  return {
    "--color-primary": company.brandColor,
    "--color-primary-dark": company.brandColorDark,
    "--color-primary-light": hexToRgba(company.brandColor, 0.12),
    "--color-secondary": company.secondaryColor,
    "--color-secondary-dark": shadeColor(company.secondaryColor, -15),
    "--color-accent": company.accentColor,
    "--color-accent-hover": shadeColor(company.accentColor, -15),
    "--company-font-family": config.fontFamily,
  };
}

export function getLogoUrl(company, variant = "header") {
  const config = getCompanyConfig(company?.slug);
  if (variant === "header") {
    return config.logoDarkHeader || company?.logoUrl || config.logoLightFooter;
  }
  return config.logoLightFooter || company?.logoUrl || config.logoDarkHeader;
}

export function shouldInvertLogo(company) {
  const config = getCompanyConfig(company?.slug);
  return config.invertOnDark;
}

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadeColor(color, percent) {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

export function getDefaultBio(companyName, labels) {
  const exec = labels?.executive || "ejecutivo";
  return `Como tu ${exec} comercial de ${companyName}, te ayudo a gestionar tu contrato de forma rápida y transparente. Olvídate de largas esperas en call centers. Analizo la cobertura de tu sector en minutos y agendo tu instalación en tiempo récord.`;
}
