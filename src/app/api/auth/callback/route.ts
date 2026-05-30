import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { getUserOctokit } from "@/lib/github";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?error=token_failed", req.url));
    }

    const octokit = getUserOctokit(accessToken);
    const { data: githubUser } = await octokit.rest.users.getAuthenticated();

    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        login: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        email: githubUser.email,
        name: githubUser.name,
        githubToken: accessToken,
      },
      create: {
        githubId: githubUser.id,
        login: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        email: githubUser.email,
        name: githubUser.name,
        githubToken: accessToken,
        plan: "free",
        reviewsUsed: 0,
        reviewsLimit: 5,
      },
    });

    await createSession({
      id: user.id,
      githubId: user.githubId,
      login: user.login,
      avatarUrl: user.avatarUrl,
      email: user.email,
      plan: user.plan,
      reviewsUsed: user.reviewsUsed,
      reviewsLimit: user.reviewsLimit,
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
