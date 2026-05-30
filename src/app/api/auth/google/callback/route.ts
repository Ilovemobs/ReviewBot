import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?error=token_failed", req.url));
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    const user = await prisma.user.upsert({
      where: { googleId: profile.id },
      update: {
        googleId: profile.id,
        login: profile.email || profile.name || `user-${profile.id}`,
        avatarUrl: profile.picture,
        email: profile.email,
        name: profile.name,
      },
      create: {
        googleId: profile.id,
        login: profile.email || profile.name || `user-${profile.id}`,
        avatarUrl: profile.picture,
        email: profile.email,
        name: profile.name,
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
    console.error("Google auth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
