import { getSession, refreshUserFromDb } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const fresh = await refreshUserFromDb(session);

  const reviews = await prisma.review.findMany({
    where: { userId: fresh.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const installations = await prisma.installation.findMany({
    where: { userId: fresh.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardClient
      user={fresh}
      reviews={reviews.map((r) => ({
        id: r.id,
        repoFullName: r.repoFullName,
        prNumber: r.prNumber,
        prTitle: r.prTitle || "",
        prUrl: r.prUrl || "",
        status: r.status,
        overallSeverity: r.overallSeverity || "",
        createdAt: r.createdAt.toISOString(),
        error: r.error || undefined,
      }))}
      installations={installations.map((i) => ({
        id: i.id,
        fullName: i.fullName || `${i.owner}/${i.repo || ""}`,
        enabled: i.enabled,
        installationId: i.installationId,
      }))}
    />
  );
}
