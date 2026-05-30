import { NextRequest, NextResponse } from "next/server";
import { signMagicToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    if (!email) return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });

    const token = await signMagicToken(email);
    const link = `${process.env.APP_URL}/api/auth/email/callback?token=${encodeURIComponent(token)}`;

    // For now, log the link. In production, send via email provider.
    console.log(`Magic sign-in link for ${email}: ${link}`);

    return NextResponse.json({ ok: true, link });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
