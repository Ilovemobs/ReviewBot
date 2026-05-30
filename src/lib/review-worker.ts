import prisma from "./prisma";
import { getPRDiff, getPRDetails, postReviewComment } from "./github";
import { securityReview } from "./agents/security";
import { bugRiskReview } from "./agents/bugrisk";
import { qualityReview } from "./agents/quality";
import { aggregateReviews } from "./agents/aggregator";

function truncateDiff(diff: string, maxChars: number = 25000): string {
  if (diff.length <= maxChars) return diff;
  return diff.slice(0, maxChars) + "\n\n... (diff truncated)";
}

export async function runReview(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: "in_progress" },
  });

  const [owner, repo] = review.repoFullName.split("/");

  const installation = await prisma.installation.findFirst({
    where: { fullName: review.repoFullName },
  });

  if (!installation) {
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "failed", error: "No installation found for this repository" },
    });
    return;
  }

  try {
    const diff = await getPRDiff(owner, repo, review.prNumber, installation.installationId);
    const prDetails = await getPRDetails(owner, repo, review.prNumber, installation.installationId);

    const truncatedDiff = truncateDiff(diff);

    const [securityResult, bugRiskResult, qualityResult] = await Promise.all([
      securityReview(truncatedDiff),
      bugRiskReview(truncatedDiff),
      qualityReview(truncatedDiff),
    ]);

    const aggregated = await aggregateReviews(
      securityResult,
      bugRiskResult,
      qualityResult,
      truncatedDiff
    );

    const reviewBody = formatReviewBody(aggregated, prDetails.url);

    await postReviewComment(owner, repo, review.prNumber, installation.installationId, reviewBody);

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: "completed",
        overallSeverity: aggregated.overallSeverity,
        mergeRecommendation: aggregated.mergeRecommendation,
        summary: aggregated.summary,
        findings: JSON.stringify(aggregated),
        completedAt: new Date(),
      },
    });

    const user = await prisma.user.findUnique({ where: { id: review.userId } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { reviewsUsed: { increment: 1 } },
      });
    }
  } catch (err: any) {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: "failed",
        error: err.message || "Unknown error during review",
        completedAt: new Date(),
      },
    });
  }
}

function formatSeverityBadge(severity: string): string {
  const colors: Record<string, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵",
    none: "✅",
  };
  return `${colors[severity] || "⚪"} **${severity.toUpperCase()}**`;
}

function formatReviewBody(aggregated: any, prUrl: string): string {
  const { summary, overallSeverity, mergeRecommendation, findings, positives, topIssues } = aggregated;

  let body = `## 🤖 ReviewBot Review\n\n`;
  body += `**Overall Severity:** ${formatSeverityBadge(overallSeverity)}\n\n`;
  body += `**Recommendation:** \`${mergeRecommendation}\`\n\n`;

  if (topIssues?.length > 0) {
    body += `### Top Issues\n`;
    for (const issue of topIssues) {
      body += `- ${issue}\n`;
    }
    body += `\n`;
  }

  body += `### Summary\n${summary}\n\n`;

  if (findings?.length > 0) {
    const bySeverity: Record<string, any[]> = { critical: [], high: [], medium: [], low: [] };
    for (const f of findings) {
      if (bySeverity[f.severity]) bySeverity[f.severity].push(f);
      else bySeverity.low.push(f);
    }

    for (const sev of ["critical", "high", "medium", "low"]) {
      const items = bySeverity[sev];
      if (!items?.length) continue;

      body += `### ${sev.charAt(0).toUpperCase() + sev.slice(1)} Severity\n`;
      for (const f of items) {
        body += `**${f.title}** (${f.agent})`;
        if (f.file) body += ` — \`${f.file}${f.line ? `:${f.line}` : ""}\``;
        body += `\n`;
        body += `> ${f.description}\n\n`;
        if (f.suggestion) {
          body += `💡 *Fix suggestion:*\n`;
          body += "```\n" + f.suggestion + "\n```\n\n";
        }
      }
    }
  }

  if (positives?.length > 0) {
    body += `### ✅ What's Good\n`;
    for (const p of positives) {
      body += `- ${p.description}${p.file ? ` (\`${p.file}${p.line ? `:${p.line}` : ""}\`)` : ""}\n`;
    }
    body += `\n`;
  }

  body += `---\n`;
  body += `*Powered by ReviewBot — AI code review agent*`;

  return body;
}
