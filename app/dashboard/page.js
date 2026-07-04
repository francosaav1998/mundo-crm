import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";

const INITIAL_LIMIT = 25;

function buildStats(leads) {
  const total = leads.length;
  const nuevos = leads.filter((l) => l.status === "Nuevo").length;
  const factibles = leads.filter((l) => l.status === "Con Factibilidad").length;
  const sinFactibilidad = leads.filter((l) => l.status === "Sin Factibilidad").length;
  const contactados = leads.filter((l) => l.status === "Contactado" || l.status === "En Proceso").length;

  const byStatus = {};
  ["Nuevo", "No Contesta", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad"].forEach((s) => {
    byStatus[s] = leads.filter((l) => l.status === s).length;
  });

  const byPlan = {};
  leads.forEach((l) => {
    const name = String(l.plan || "Sin Plan").split(" (")[0];
    byPlan[name] = (byPlan[name] || 0) + 1;
  });
  const topPlans = Object.entries(byPlan)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const dailyIntake = {};
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
    dailyIntake[dateStr] = 0;
  }
  leads.forEach((l) => {
    const dateStr = new Date(l.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
    if (dailyIntake[dateStr] !== undefined) {
      dailyIntake[dateStr] += 1;
    }
  });

  const byCity = {};
  leads.forEach((l) => {
    if (l.city) byCity[l.city] = (byCity[l.city] || 0) + 1;
  });
  const topCities = Object.entries(byCity)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    total,
    nuevos,
    factibles,
    sinFactibilidad,
    contactados,
    byStatus,
    topPlans,
    dailyIntake: Object.entries(dailyIntake).map(([date, count]) => ({ date, count })),
    topCities,
    recent: leads.slice(0, 5),
  };
}

export default async function DashboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/dashboard/login");
  }

  const allLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, city: true, plan: true, status: true, createdAt: true },
  });

  const initialStats = buildStats(allLeads);
  const initialLeads = allLeads.slice(0, INITIAL_LIMIT);
  const initialTotal = allLeads.length;

  return (
    <DashboardClient
      initialLeads={initialLeads}
      initialTotal={initialTotal}
      initialStats={initialStats}
      username={session.user?.user_metadata?.name || session.user?.email || "Admin"}
    />
  );
}
