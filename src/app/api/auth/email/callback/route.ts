import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, createSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/?error=missing_token", req.url));

  const payload = await verifyMagicToken(token);
  if (!payload) return NextResponse.redirect(new URL("/?error=invalid_token", req.url));

  try {
    const email = payload.email;
    const login = email.split("@")[0];

    const user = await prisma.user.upsert({
      where: { email },
      update: { email, login },
      create: {
        login,
        email,
        plan: "free",
        reviewsUsed: 0,
        reviewsLimit: 5,
      },
    });

    await createSession({
      id: user.id,
      githubId: user.githubId ?? null,
      googleId: user.googleId ?? null,
      login: user.login,
      avatarUrl: user.avatarUrl,
      email: user.email,
      plan: user.plan,
      reviewsUsed: user.reviewsUsed,
      reviewsLimit: user.reviewsLimit,
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Email callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
