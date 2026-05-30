import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ReviewDetailClient from "./client";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return notFound();

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review || review.userId !== session.id) return notFound();

  let parsed: any = null;
  if (review.findings) {
    try {
      parsed = JSON.parse(review.findings);
    } catch {}
  }

  return (
    <ReviewDetailClient
      review={{
        id: review.id,
        repoFullName: review.repoFullName,
        prNumber: review.prNumber,
        prTitle: review.prTitle || "",
        prUrl: review.prUrl || "",
        status: review.status,
        overallSeverity: review.overallSeverity || "",
        mergeRecommendation: review.mergeRecommendation || "",
        summary: review.summary || "",
        error: review.error || "",
        createdAt: review.createdAt.toISOString(),
        completedAt: review.completedAt?.toISOString() || null,
        aggregated: parsed,
      }}
    />
  );
}
