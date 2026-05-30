"use client";

import Link from "next/link";

type Finding = {
  file?: string;
  line?: number;
  severity: string;
  category: string;
  agent?: string;
  title: string;
  description: string;
  suggestion?: string;
};

type Positive = {
  file?: string;
  line?: number;
  description: string;
};

type Aggregated = {
  summary: string;
  overallSeverity: string;
  mergeRecommendation: string;
  topIssues: string[];
  findings: Finding[];
  positives: Positive[];
} | null;

export default function ReviewDetailClient({
  review,
}: {
  review: {
    id: string;
    repoFullName: string;
    prNumber: number;
    prTitle: string;
    prUrl: string;
    status: string;
    overallSeverity: string;
    mergeRecommendation: string;
    summary: string;
    error: string;
    createdAt: string;
    completedAt: string | null;
    aggregated: Aggregated;
  };
}) {
  const severityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    none: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {review.repoFullName}#{review.prNumber}
            </h1>
            <p className="text-gray-400 mt-1">{review.prTitle}</p>
          </div>
          <a
            href={review.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View on GitHub ↗
          </a>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <StatusDisplay status={review.status} />
          {review.overallSeverity && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                severityColors[review.overallSeverity] || "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {review.overallSeverity.toUpperCase()}
            </span>
          )}
          {review.mergeRecommendation && (
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
              {review.mergeRecommendation}
            </span>
          )}
        </div>
      </div>

      {review.status === "pending" || review.status === "in_progress" ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-lg text-gray-300">⏳ Review in progress...</p>
          <p className="text-sm text-gray-500 mt-2">This page will update automatically when complete.</p>
          <meta httpEquiv="refresh" content="5" />
        </div>
      ) : review.status === "failed" ? (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Review Failed</h2>
          <p className="text-red-300 text-sm">{review.error}</p>
        </div>
      ) : review.aggregated ? (
        <div className="space-y-6">
          {review.aggregated.summary && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {review.aggregated.summary}
              </p>
            </div>
          )}

          {review.aggregated.topIssues?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Top Issues</h2>
              <ul className="space-y-2">
                {review.aggregated.topIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.aggregated.findings?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Findings</h2>
              {["critical", "high", "medium", "low"].map(
                (sev) =>
                  review.aggregated!.findings.filter((f) => f.severity === sev).length > 0 && (
                    <div key={sev} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        {sev}
                      </h3>
                      {review.aggregated!.findings
                        .filter((f) => f.severity === sev)
                        .map((f, i) => (
                          <div
                            key={i}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                              <div className="flex items-center gap-2">
                                {f.agent && (
                                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                                    {f.agent}
                                  </span>
                                )}
                              </div>
                            </div>
                            {f.file && (
                              <p className="text-xs text-gray-500 mb-2">
                                {f.file}
                                {f.line ? `:${f.line}` : ""}
                              </p>
                            )}
                            <p className="text-sm text-gray-300 mb-3">{f.description}</p>
                            {f.suggestion && (
                              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">💡 Suggestion</p>
                                <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
                                  {f.suggestion}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )
              )}
            </div>
          )}

          {review.aggregated.positives?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">✅ What&apos;s Good</h2>
              <ul className="space-y-2">
                {review.aggregated.positives.map((p, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {p.description}
                    {p.file && (
                      <span className="text-xs text-gray-500">
                        ({p.file}
                        {p.line ? `:${p.line}` : ""})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
          No review data available.
        </div>
      )}
    </div>
  );
}

function StatusDisplay({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const s = map[status] || { label: status, color: "bg-gray-800 text-gray-400 border-gray-700" };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${s.color}`}>{s.label}</span>
  );
}
