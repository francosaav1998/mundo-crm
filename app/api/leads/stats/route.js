import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";

const SELLER_STATUSES = ["Nuevo", "No Contesta", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad"];
const ADMIN_STATUSES = ["Nuevo", "Contactado", "Interesado", "Cliente Activo", "No Interesado"];

function getDateRange(filter, customDate) {
  const now = new Date();
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  switch (filter) {
    case "hoy":
      return { gte: startOfDay(now), lte: endOfDay(now) };
    case "ayer": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { gte: startOfDay(yesterday), lte: endOfDay(yesterday) };
    }
    case "semana": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return { gte: startOfDay(weekAgo), lte: endOfDay(now) };
    }
    case "mes": {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return { gte: startOfDay(monthAgo), lte: endOfDay(now) };
    }
    case "custom": {
      if (!customDate) return undefined;
      const selected = new Date(customDate + "T12:00:00");
      if (isNaN(selected.getTime())) return undefined;
      return { gte: startOfDay(selected), lte: endOfDay(selected) };
    }
    default:
      return undefined;
  }
}

export async function GET(request) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get("search") || "").trim().toLowerCase();
    const status = String(searchParams.get("status") || "").trim();
    const dateFilter = String(searchParams.get("dateFilter") || "todos").trim();
    const customDate = String(searchParams.get("customDate") || "").trim();

    const where = {};
    const userIsAdmin = isAdmin(session.user);

    if (userIsAdmin) {
      where.sellerId = null;
    } else {
      const userId = session.user?.id;
      const userEmail = session.user?.email || "";
      const seller = await prisma.seller.findUnique({ where: { userId } }) || await prisma.seller.findFirst({ where: { email: userEmail } });
      if (seller) {
        where.sellerId = seller.id;
      } else {
        where.assignedTo = userEmail;
      }
    }

    if (status && status !== "Todos") {
      where.status = status;
    }

    const dateRange = getDateRange(dateFilter, customDate);
    if (dateRange) {
      where.createdAt = dateRange;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { plan: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true, city: true, plan: true, status: true, createdAt: true },
    });

    // KPIs
    const statusSet = userIsAdmin ? ADMIN_STATUSES : SELLER_STATUSES;
    const total = leads.length;
    const nuevos = leads.filter((l) => l.status === "Nuevo").length;
    const contactados = userIsAdmin
      ? leads.filter((l) => l.status === "Contactado").length
      : leads.filter((l) => l.status === "Contactado" || l.status === "En Proceso").length;
    const factibles = leads.filter((l) => l.status === "Con Factibilidad").length;
    const sinFactibilidad = leads.filter((l) => l.status === "Sin Factibilidad").length;
    const interesados = leads.filter((l) => l.status === "Interesado").length;
    const clientesActivos = leads.filter((l) => l.status === "Cliente Activo").length;

    // Status distribution
    const byStatus = {};
    statusSet.forEach((s) => {
      byStatus[s] = leads.filter((l) => l.status === s).length;
    });

    // Plan distribution
    const byPlan = {};
    leads.forEach((l) => {
      const name = String(l.plan || "Sin Plan").split(" (")[0];
      byPlan[name] = (byPlan[name] || 0) + 1;
    });
    const topPlans = Object.entries(byPlan)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Daily intake (last 10 days)
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

    // Top cities
    const byCity = {};
    leads.forEach((l) => {
      if (l.city) byCity[l.city] = (byCity[l.city] || 0) + 1;
    });
    const topCities = Object.entries(byCity)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Recent leads
    const recent = leads.slice(0, 5);

    const response = {
      total,
      nuevos,
      factibles,
      sinFactibilidad,
      contactados,
      interesados,
      clientesActivos,
      byStatus,
      topPlans,
      dailyIntake: Object.entries(dailyIntake).map(([date, count]) => ({ date, count })),
      topCities,
      recent,
    };

    if (userIsAdmin) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const sellers = await prisma.seller.findMany({
        where: { active: true },
        select: { createdAt: true },
      });
      response.totalSellers = await prisma.seller.count();
      response.activeSellers = sellers.length;
      response.sellersLast7Days = sellers.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;
      response.trialExpiredSellers = sellers.filter((s) => new Date(s.createdAt) < sevenDaysAgo).length;
    }

    return NextResponse.json(response);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
