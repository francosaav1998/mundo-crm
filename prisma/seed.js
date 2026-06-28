import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const comunas = ["Santiago", "La Florida", "Providencia", "Las Condes", "Maipú", "Puente Alto"];
const planes = ["Fibra 500 Mbps", "Fibra 1 Gbps", "TV Hogar + Fibra", "Telefonía Móvil 100GB", "Full Hogar"];
const estados = ["Nuevo", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad", "No Contesta"];
const nombres = ["María González", "Juan Pérez", "Carla Soto", "Pedro Rojas", "Valentina Díaz", "Diego Herrera", "Camila Muñoz", "Andrés Torres", "Fernanda Castillo", "Sebastián Araya"];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return `+569${Math.floor(10000000 + Math.random() * 90000000)}`; }
function randomEmail(name) {
  const slug = name.toLowerCase().replace(/\s/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${slug}@${randomPick(["gmail.com", "outlook.com", "hotmail.com"])}`;
}

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { username: "admin" },
  });

  if (!existing) {
    const password = await bcrypt.hash("mundo2026", 10);
    await prisma.admin.create({
      data: { username: "admin", password },
    });
    console.log("Usuario admin creado: admin / mundo2026");
  } else {
    console.log("Usuario admin ya existe");
  }

  const count = await prisma.lead.count();
  if (count === 0) {
    await prisma.lead.createMany({
      data: nombres.map((name) => ({
        name,
        phone: randomPhone(),
        email: Math.random() > 0.2 ? randomEmail(name) : "",
        city: randomPick(comunas),
        address: "Av. Siempre Viva " + Math.floor(100 + Math.random() * 900),
        plan: randomPick(planes),
        status: randomPick(estados),
      })),
    });
    console.log(`${nombres.length} leads de ejemplo creados`);
  } else {
    console.log("Leads ya existen");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
