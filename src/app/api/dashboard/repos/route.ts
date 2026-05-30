import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const installations = await prisma.installation.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ installations });
}
