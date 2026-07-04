import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";

const INITIAL_LIMIT = 25;

export default async function DashboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/dashboard/login");
  }

  const [initialLeads, initialTotal] = await prisma.$transaction([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: INITIAL_LIMIT,
      select: { id: true, name: true, phone: true, city: true, plan: true, status: true, createdAt: true },
    }),
    prisma.lead.count(),
  ]);

  return (
    <DashboardClient
      initialLeads={initialLeads}
      initialTotal={initialTotal}
      username={session.user?.user_metadata?.name || session.user?.email || "Admin"}
    />
  );
}
