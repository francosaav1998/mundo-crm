import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMPANIES = [
  {
    slug: "mundo",
    name: "Mundo",
    brandColor: "#00748E",
    brandColorDark: "#005A6F",
    secondaryColor: "#FDDC02",
    accentColor: "#FF8000",
    logoUrl: "https://www.tumundo.cl/wp-content/uploads/2022/12/isotipo.png",
    websiteUrl: "https://www.tumundo.cl",
    order: 1,
  },
  {
    slug: "movistar",
    name: "Movistar",
    brandColor: "#003366",
    brandColorDark: "#001a33",
    secondaryColor: "#00B8E6",
    accentColor: "#E31937",
    logoUrl: "https://ww2.movistar.cl/base/img/iconografia-menu/logo-movistar.svg",
    websiteUrl: "https://ww2.movistar.cl",
    order: 2,
  },
  {
    slug: "claro",
    name: "Claro",
    brandColor: "#E31937",
    brandColorDark: "#B71C1C",
    secondaryColor: "#FFD400",
    accentColor: "#E31937",
    logoUrl: "https://www.clarochile.cl/portal/cl/recursos_tema_evo/assets/vector/logo-claro-blanco.svg",
    websiteUrl: "https://www.clarochile.cl",
    order: 3,
  },
  {
    slug: "vtr",
    name: "VTR",
    brandColor: "#5C2D91",
    brandColorDark: "#3E1C66",
    secondaryColor: "#F47920",
    accentColor: "#F47920",
    logoUrl: "https://www.vtr.com/content/b2c/2nzYdvWEr8RiGJ4JFpezOM/logo-vtr-small.png",
    websiteUrl: "https://vtr.com",
    order: 4,
  },
  {
    slug: "wom",
    name: "WOM",
    brandColor: "#E6007E",
    brandColorDark: "#9C0054",
    secondaryColor: "#FFD600",
    accentColor: "#6A1B9A",
    logoUrl: "https://images.ctfassets.net/vlub6abkwzvo/2ShWjPXcxzlLkgtic62hes/a7c11a86c399b6e6283d0c6ac6e87ca1/Vector__2_.svg",
    websiteUrl: "https://store.wom.cl",
    order: 5,
  },
  {
    slug: "entel",
    name: "Entel",
    brandColor: "#004FB6",
    brandColorDark: "#003B8E",
    secondaryColor: "#FF6600",
    accentColor: "#FF6600",
    logoUrl: "https://entel.cdn.modyo.com/uploads/2bdf0650-482f-45b7-a340-2d9700e880ea/original/Size_Extra_large_xl_22_.png",
    websiteUrl: "https://www.entel.cl",
    order: 6,
  },
];

const BASE_FEATURES = {
  internet: [
    { icon: "bi-speedometer2", text: "Velocidad simétrica de bajada y subida" },
    { icon: "bi-router-fill", text: "Router Wi-Fi de alta cobertura" },
    { icon: "bi-infinity", text: "Navegación ilimitada sin límites de descarga" },
    { icon: "bi-tools", text: "Instalación sin costo" },
  ],
  duo: [
    { icon: "bi-speedometer2", text: "Internet fibra óptica simétrica" },
    { icon: "bi-tv", text: "Televisión digital incluida" },
    { icon: "bi-router-fill", text: "Router Wi-Fi de alta cobertura" },
    { icon: "bi-film", text: "Plataformas de streaming incluidas" },
  ],
};

function buildPlan(companySlug, category, title, speed, speedLabel, price, priceSubtitle, options = {}) {
  return {
    companySlug,
    category,
    title,
    speed,
    speedLabel,
    price,
    priceSubtitle,
    features: options.features || BASE_FEATURES[category],
    featured: options.featured || false,
    value: options.value || `${title} (${price})`,
    planOrder: options.order || 0,
  };
}

const PLANS = {
  mundo: [
    buildPlan("mundo", "internet", "Fibra Súper Rápida", "800", "Mbps", "$12.990", "Fibra óptica directa", {
      value: "Plan Fibra 800 Megas ($12.990)",
      order: 1,
    }),
    buildPlan("mundo", "internet", "Hiper Fibra Giga", "1", "Giga", "$15.990", "Velocidad extrema para múltiples dispositivos", {
      value: "Plan Hiper Fibra 1 Giga ($15.990)",
      featured: true,
      order: 2,
    }),
    buildPlan("mundo", "duo", "Dúo Pack Plus", "800", "Mbps + TV GO!", "$23.990", "Internet + TV interactiva", {
      value: "Plan Dúo 800 Megas + TV ($23.990)",
      order: 3,
    }),
    buildPlan("mundo", "duo", "Dúo Pack Premium Giga", "1", "Giga + TV GO!", "$26.990", "La experiencia de entretenimiento definitiva", {
      value: "Plan Dúo 1 Giga + TV ($26.990)",
      order: 4,
    }),
  ],
  movistar: [
    buildPlan("movistar", "internet", "Fibra 600", "600", "Megas", "$14.990", "Por 6 meses, luego $18.990/mes", {
      value: "Movistar Fibra 600 Megas ($14.990)",
      order: 1,
    }),
    buildPlan("movistar", "internet", "Fibra 800", "800", "Megas", "$19.990", "Precio único sin sorpresas", {
      value: "Movistar Fibra 800 Megas ($19.990)",
      order: 2,
    }),
    buildPlan("movistar", "internet", "Fibra Giga", "940", "Megas", "$18.990", "Por 12 meses, luego $26.990/mes", {
      value: "Movistar Fibra Giga ($18.990)",
      featured: true,
      order: 3,
    }),
    buildPlan("movistar", "duo", "Dúo Fibra 600 + TV", "600", "Megas + TV", "$28.990", "Por 6 meses, luego $36.990/mes", {
      value: "Movistar Dúo 600 + TV ($28.990)",
      order: 4,
    }),
  ],
  claro: [
    buildPlan("claro", "internet", "Fibra 600", "600", "Megas", "$14.990", "Por 12 meses, luego $21.990/mes", {
      value: "Claro Fibra 600 Megas ($14.990)",
      order: 1,
    }),
    buildPlan("claro", "internet", "Fibra 800", "800", "Megas", "$15.990", "Por 12 meses, luego $23.990/mes", {
      value: "Claro Fibra 800 Megas ($15.990)",
      order: 2,
    }),
    buildPlan("claro", "internet", "Fibra 940", "940", "Megas", "$19.990", "Por 12 meses, luego $29.990/mes", {
      value: "Claro Fibra 940 Megas ($19.990)",
      featured: true,
      order: 3,
    }),
    buildPlan("claro", "internet", "Internet 500", "500", "Megas", "$14.990", "Por 12 meses, luego $21.990/mes", {
      value: "Claro Internet 500 Megas ($14.990)",
      order: 4,
    }),
  ],
  vtr: [
    buildPlan("vtr", "internet", "Fibra Hogar", "600", "Megas", "$14.990", "Por 12 meses, luego $21.990/mes", {
      value: "VTR Fibra Hogar 600 Megas ($14.990)",
      order: 1,
    }),
    buildPlan("vtr", "internet", "Fibra Gamer Giga", "940", "Megas", "$19.990", "Por 12 meses, luego $29.990/mes", {
      value: "VTR Fibra Gamer Giga ($19.990)",
      featured: true,
      order: 2,
    }),
  ],
  wom: [
    buildPlan("wom", "internet", "Fibra 600", "600", "Megas", "$13.990", "Desde mes 13 $21.990/mes", {
      value: "WOM Fibra 600 Megas ($13.990)",
      order: 1,
    }),
    buildPlan("wom", "internet", "Fibra 800", "800", "Megas", "$14.990", "Desde mes 13 $24.990/mes", {
      value: "WOM Fibra 800 Megas ($14.990)",
      featured: true,
      order: 2,
    }),
    buildPlan("wom", "internet", "Fibra 940", "940", "Megas", "$18.990", "Desde mes 13 $33.990/mes", {
      value: "WOM Fibra 940 Megas ($18.990)",
      order: 3,
    }),
  ],
  entel: [
    buildPlan("entel", "internet", "Fibra 600", "600", "Megas", "$15.990", "Por 12 meses, luego $22.990/mes", {
      value: "Entel Fibra 600 Megas ($15.990)",
      order: 1,
    }),
    buildPlan("entel", "internet", "Fibra 800", "800", "Megas", "$16.990", "Por 12 meses, luego $25.990/mes", {
      value: "Entel Fibra 800 Megas ($16.990)",
      order: 2,
    }),
    buildPlan("entel", "internet", "Fibra Giga", "940", "Megas", "$20.990", "Por 12 meses, luego $33.990/mes", {
      value: "Entel Fibra Giga ($20.990)",
      featured: true,
      order: 3,
    }),
    buildPlan("entel", "internet", "Fibra 2 Gigas", "2.000", "Megas", "$27.990", "Por 12 meses, luego $39.990/mes", {
      value: "Entel Fibra 2 Gigas ($27.990)",
      order: 4,
    }),
  ],
};

async function seedCompanies() {
  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: company,
      create: company,
    });
  }
  console.log(`${COMPANIES.length} compañías creadas/actualizadas`);
}

async function seedPlans() {
  for (const [slug, plans] of Object.entries(PLANS)) {
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) {
      console.warn(`Compañía no encontrada: ${slug}`);
      continue;
    }

    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { value: plan.value },
        update: {
          ...plan,
          companyId: company.id,
          companySlug: undefined,
        },
        create: {
          ...plan,
          companyId: company.id,
          companySlug: undefined,
        },
      });
    }
  }
  const totalPlans = Object.values(PLANS).flat().length;
  console.log(`${totalPlans} planes creados/actualizados`);
}

async function seedSampleLeads() {
  const comunas = ["Santiago", "La Florida", "Providencia", "Las Condes", "Maipú", "Puente Alto"];
  const estados = ["Nuevo", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad", "No Contesta"];
  const nombres = ["María González", "Juan Pérez", "Carla Soto", "Pedro Rojas", "Valentina Díaz", "Diego Herrera", "Camila Muñoz", "Andrés Torres", "Fernanda Castillo", "Sebastián Araya"];

  const count = await prisma.lead.count();
  if (count > 0) {
    console.log("Leads de ejemplo ya existen");
    return;
  }

  const plans = await prisma.plan.findMany({ where: { active: true } });
  if (plans.length === 0) {
    console.log("No hay planes para crear leads de ejemplo");
    return;
  }

  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randomPhone() { return `+569${Math.floor(10000000 + Math.random() * 90000000)}`; }
  function randomEmail(name) {
    const slug = name.toLowerCase().replace(/\s/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${slug}@${randomPick(["gmail.com", "outlook.com", "hotmail.com"])}`;
  }

  await prisma.lead.createMany({
    data: nombres.map((name) => {
      const plan = randomPick(plans);
      return {
        name,
        phone: randomPhone(),
        email: Math.random() > 0.2 ? randomEmail(name) : "",
        city: randomPick(comunas),
        address: "Av. Siempre Viva " + Math.floor(100 + Math.random() * 900),
        plan: plan.value,
        planId: plan.id,
        status: randomPick(estados),
      };
    }),
  });
  console.log(`${nombres.length} leads de ejemplo creados`);
}

async function main() {
  await seedCompanies();
  await seedPlans();
  await seedSampleLeads();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
