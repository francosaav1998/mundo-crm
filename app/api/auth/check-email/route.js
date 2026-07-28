import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ exists: false });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Revisar en la DB local (sellers)
    const existingSeller = await prisma.seller.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingSeller) {
      return NextResponse.json({ exists: true });
    }

    // 2. Revisar en Supabase Auth
    const supabase = createServiceClient();
    const { data } = await supabase.auth.admin.listUsers();
    const authUser = data?.users?.some((u) => u.email === normalizedEmail);

    return NextResponse.json({ exists: !!authUser });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
