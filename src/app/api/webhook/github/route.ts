import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runReview } from "@/lib/review-worker";

async function findOrCreateUser(githubUserLogin: string): Promise<string | null> {
  const user = await prisma.user.findFirst({ where: { login: githubUserLogin } });
  return user?.id || null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";
  const event = req.headers.get("x-github-event") || "";
  const deliveryId = req.headers.get("x-github-delivery") || "";

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 401 });
  }

  if (event !== "pull_request") {
    return NextResponse.json({ ok: true, message: "Ignored event type" });
  }

  try {
    const payload = JSON.parse(body);
    const action = payload.action;

    if (!["opened", "synchronize", "reopened"].includes(action)) {
      return NextResponse.json({ ok: true, message: `Ignored action: ${action}` });
    }

    const pr = payload.pull_request;
    const repo = payload.repository;
    const installationId = payload.installation?.id;
    const senderLogin = payload.sender?.login;

    if (!installationId) {
      return NextResponse.json({ error: "No installation" }, { status: 400 });
    }

    const fullName = repo.full_name;
    const prNumber = pr.number;
    const prTitle = pr.title;
    const prUrl = pr.html_url;
    const headSha = pr.head.sha;

    let userId = await findOrCreateUser(senderLogin);

    if (!userId) {
      const installations = await prisma.installation.findFirst({
        where: { fullName },
      });
      userId = installations?.userId || null;
    }

    if (!userId) {
      return NextResponse.json({ error: "No user associated" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.reviewsUsed >= user.reviewsLimit) {
      const existingReview = await prisma.review.findUnique({
        where: { repoFullName_prNumber: { repoFullName: fullName, prNumber } },
      });

      if (!existingReview) {
        await prisma.review.create({
          data: {
            repoFullName: fullName,
            prNumber,
            prTitle,
            prUrl,
            commitSha: headSha,
            status: "failed",
            error: "Review limit reached. Upgrade your plan.",
            userId: user.id,
          },
        });
      }

      return NextResponse.json({ error: "Review limit reached" }, { status: 402 });
    }

    await prisma.installation.upsert({
      where: { installationId },
      update: { owner: repo.owner.login, repo: repo.name, fullName, userId },
      create: {
        installationId,
        owner: repo.owner.login,
        repo: repo.name,
        fullName,
        userId,
        enabled: true,
      },
    });

    const review = await prisma.review.upsert({
      where: { repoFullName_prNumber: { repoFullName: fullName, prNumber } },
      update: {
        prTitle,
        prUrl,
        commitSha: headSha,
        status: "pending",
        error: null,
        findings: null,
        completedAt: null,
      },
      create: {
        repoFullName: fullName,
        prNumber,
        prTitle,
        prUrl,
        commitSha: headSha,
        status: "pending",
        userId: user.id,
      },
    });

    runReview(review.id).catch((err) => {
      console.error(`Review ${review.id} failed:`, err);
    });

    return NextResponse.json({ ok: true, reviewId: review.id }, { status: 202 });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
