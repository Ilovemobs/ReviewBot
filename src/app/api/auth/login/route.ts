import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") || "github";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
    const scope = encodeURIComponent("openid email profile");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return NextResponse.redirect(url);
  }

  // default to GitHub
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email`;

  return NextResponse.redirect(url);
}
