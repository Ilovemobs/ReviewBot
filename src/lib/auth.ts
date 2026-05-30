import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-secret-change-me");
const COOKIE_NAME = "session";

export type SessionUser = {
  id: string;
  githubId?: number | null;
  googleId?: string | null;
  login: string;
  avatarUrl: string | null;
  email: string | null;
  plan: string;
  reviewsUsed: number;
  reviewsLimit: number;
};

function getBaseUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const url = `${getBaseUrl()}/`;
    throw new RedirectError(url);
  }
  return session;
}

export class RedirectError extends Error {
  url: string;
  constructor(url: string) {
    super("Redirect");
    this.url = url;
  }
}

export async function refreshUserFromDb(session: SessionUser): Promise<SessionUser> {
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return session;
  return {
    id: user.id,
    githubId: user.githubId,
    login: user.login,
    avatarUrl: user.avatarUrl,
    email: user.email,
    plan: user.plan,
    reviewsUsed: user.reviewsUsed,
    reviewsLimit: user.reviewsLimit,
  };
}

export async function signMagicToken(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(SECRET);
  return token;
}

export async function verifyMagicToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as { email: string };
  } catch {
    return null;
  }
}
