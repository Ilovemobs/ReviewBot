import { NextRequest, NextResponse } from "next/server";
import { getSession, refreshUserFromDb } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const fresh = await refreshUserFromDb(session);
    const repo = req.nextUrl.searchParams.get("repo");

    const where: any = { userId: fresh.id };
    if (repo) {
      where.repoFullName = repo;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("Reviews endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
