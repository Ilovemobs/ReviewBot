import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email`;

  return NextResponse.redirect(url);
}
