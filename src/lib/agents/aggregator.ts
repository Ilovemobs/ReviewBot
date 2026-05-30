import { callAI } from "../ai";

const SYSTEM = `You are a review aggregator. Combine findings from multiple review agents into a final structured report.
Return JSON:
{
  "summary": "2-3 paragraph overall assessment",
  "overallSeverity": "critical" | "high" | "medium" | "low" | "none",
  "mergeRecommendation": "approve" | "changes" | "comment",
  "topIssues": ["Most important issue 1", "issue 2", "issue 3"],
  "findings": [
    {
      "file": "path/to/file",
      "line": 42,
      "severity": "critical" | "high" | "medium" | "low",
      "category": "security" | "bug" | "performance" | "style",
      "agent": "security" | "bugrisk" | "quality",
      "title": "Short title",
      "description": "Explanation",
      "suggestion": "Fix"
    }
  ]
}

Merge duplicates, deduplicate by keeping the higher severity. Sort by severity.`;

export async function aggregateReviews(
  security: any,
  bugRisk: any,
  quality: any,
  diff: string
): Promise<{
  summary: string;
  overallSeverity: string;
  mergeRecommendation: string;
  topIssues: string[];
  findings: any[];
  positives: any[];
}> {
  const input = JSON.stringify({
    securityFindings: security.findings || [],
    bugRiskFindings: bugRisk.findings || [],
    qualityFindings: quality.findings || [],
    qualityPositives: quality.positives || [],
  });

  const raw = await callAI(
    SYSTEM,
    `Aggregate these review results:\n\n${input}\n\nOriginal diff context:\n${diff.slice(0, 3000)}`,
    { maxTokens: 4096 }
  );

  try {
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || "No significant issues found.",
      overallSeverity: parsed.overallSeverity || "none",
      mergeRecommendation: parsed.mergeRecommendation || "comment",
      topIssues: parsed.topIssues || [],
      findings: parsed.findings || [],
      positives: quality.positives || [],
    };
  } catch {
    return {
      summary: "Review completed.",
      overallSeverity: "medium",
      mergeRecommendation: "comment",
      topIssues: ["Could not parse aggregated results"],
      findings: [],
      positives: [],
    };
  }
}
