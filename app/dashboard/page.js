import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/dashboard/login");
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient initialLeads={leads} username={session.username} />;
}
