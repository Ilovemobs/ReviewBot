import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET() {
  await destroySession();
  return NextResponse.redirect(new URL("/", process.env.APP_URL));
}
