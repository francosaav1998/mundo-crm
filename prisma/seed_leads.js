const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CITIES = ["Concepción", "Temuco", "Santiago", "Valparaíso", "Chillán", "Los Ángeles", "Talca", "Rancagua", "Osorno", "Puerto Montt"];
const PLANS = [
  "Plan Fibra 800 Megas ($12.990)",
  "Plan Hiper Fibra 1 Giga ($15.990)",
  "Plan Dúo 800 Megas + TV ($23.990)",
  "Plan Dúo 1 Giga + TV ($26.990)",
  "Plan Móvil Gigas Libres ($5.990)"
];
const STATUSES = ["Nuevo", "No Contesta", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad"];
const NAMES = [
  "Juan Pérez", "María González", "Carlos Muñoz", "Ana Silva", "Luis Rojas", "Carmen Díaz",
  "Jorge Contreras", "Claudia Herrera", "Andrés Castro", "Patricia Valenzuela", "Francisco Soto",
  "Elizabeth Jara", "Roberto Pino", "Jessica Tapia", "Felipe Sepúlveda", "Daniela Morales",
  "Cristián Carrasco", "Carolina Alarcón", "Mauricio Fuentes", "Sandra Henríquez", "Pedro Vera",
  "Gloria Rivas", "Manuel Salazar", "Verónica Ortiz", "Eduardo Gutiérrez", "Mónica Espinoza",
  "Hugo San Martín", "Paula Vidal", "Héctor Vergara", "Sylvia Contreras", "Víctor Carvajal",
  "Loreto Araya", "Julio Medina", "Gabriela Castillo", "René Cáceres", "Camila Maldonado",
  "Ricardo Toledo", "Andrea Figueroa", "Jaime Garrido", "Alejandra Campos", "Fernando Pizarro",
  "Nancy Godoy", "Óscar Farías", "Sonia Leyton", "Álvaro Loyola", "Valeria Poblete"
];

async function seed() {
  console.log("Limpiando leads antiguos...");
  await prisma.lead.deleteMany();

  console.log("Generando leads ficticios para los últimos 30 días garantizando que todos los días tengan datos...");
  const leadsToCreate = [];
  const now = new Date();

  // Generate 1 to 4 leads per day for the last 30 days (no zero gaps)
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - i);
    
    // Guaranteed 1 to 4 leads per day
    const dailyCount = Math.floor(Math.random() * 4) + 1; 
    
    for (let j = 0; j < dailyCount; j++) {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const phone = "+569" + Math.floor(10000000 + Math.random() * 90000000);
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const address = `Calle Principal ${Math.floor(Math.random() * 1999) + 1}, Depto ${Math.floor(Math.random() * 99) + 1}`;
      const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const notes = Math.random() > 0.5 ? "Interesado en instalación inmediata. Factibilidad pendiente." : "";
      
      // Set random hour for this day
      const leadDate = new Date(targetDate);
      leadDate.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60), 0);

      leadsToCreate.push({
        name,
        phone,
        city,
        address,
        plan,
        status,
        notes,
        createdAt: leadDate,
        updatedAt: leadDate
      });
    }
  }

  // Create them in the database
  for (const lead of leadsToCreate) {
    await prisma.lead.create({ data: lead });
  }

  console.log(`¡Sembrado completado exitosamente! Se crearon ${leadsToCreate.length} leads sin vacíos diarios.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
