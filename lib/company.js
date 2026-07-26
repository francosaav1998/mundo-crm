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
    logoDarkHeader: "/company-logos/movistar.png",
    logoLightFooter: "/company-logos/movistar.png",
    invertOnDark: true,
  },
  claro: {
    fontFamily: '"Source Sans 3", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700;800;900&display=swap",
    logoDarkHeader: "/company-logos/claro.png",
    logoLightFooter: "/company-logos/claro.png",
    invertOnDark: false,
  },
  vtr: {
    fontFamily: '"Montserrat", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    logoDarkHeader: "/company-logos/vtr.webp",
    logoLightFooter: "/company-logos/vtr.webp",
    invertOnDark: false,
  },
  wom: {
    fontFamily: '"Montserrat", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
    logoDarkHeader: "/company-logos/wom.png",
    logoLightFooter: "/company-logos/wom.png",
    invertOnDark: false,
  },
  entel: {
    fontFamily: '"Barlow", sans-serif',
    googleFontUrl:
      "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&display=swap",
    logoDarkHeader: "/company-logos/entel.jpg",
    logoLightFooter: "/company-logos/entel.jpg",
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
      "--color-primary-darker": "#003D4A",
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
    "--color-primary-darker": shadeColor(company.brandColor, -30),
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
  const customLogo = company?.logoUrl?.trim();

  // Mundo usa variantes claras/oscuras del wordmark; para el resto, si la
  // compañía ya tiene un logo cargado en BD, le damos prioridad.
  if (company?.slug !== "mundo" && customLogo) {
    return customLogo;
  }

  if (variant === "header") {
    return config.logoDarkHeader || customLogo || config.logoLightFooter;
  }
  return config.logoLightFooter || customLogo || config.logoDarkHeader;
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
