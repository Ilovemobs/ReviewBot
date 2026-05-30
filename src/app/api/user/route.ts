import { NextResponse } from "next/server";
import { getSession, refreshUserFromDb } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const fresh = await refreshUserFromDb(session);
  return NextResponse.json({ user: fresh });
}
