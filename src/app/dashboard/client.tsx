"use client";

import Link from "next/link";

type Review = {
  id: string;
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  status: string;
  overallSeverity: string;
  createdAt: string;
  error?: string;
};

type Installation = {
  id: string;
  fullName: string;
  enabled: boolean;
  installationId: number;
};

export default function DashboardClient({
  user,
  reviews,
  installations,
}: {
  user: { login: string; reviewsUsed: number; reviewsLimit: number; plan: string };
  reviews: Review[];
  installations: Installation[];
}) {
  const usagePercent = Math.round((user.reviewsUsed / user.reviewsLimit) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user.login}.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Reviews Used</p>
          <p className="text-2xl font-bold text-white">
            {user.reviewsUsed} / {user.reviewsLimit}
          </p>
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 80 ? "bg-red-500" : usagePercent >= 50 ? "bg-yellow-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {user.plan === "free" && (
            <Link href="/pricing" className="mt-3 inline-block text-sm text-blue-400 hover:text-blue-300">
              Upgrade for unlimited reviews →
            </Link>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Repositories</p>
          <p className="text-2xl font-bold text-white">{installations.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Plan</p>
          <p className="text-2xl font-bold text-white capitalize">{user.plan}</p>
        </div>
      </div>

      {installations.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-2">No repositories connected yet.</p>
          <p className="text-sm text-gray-500 mb-4">
            Install the ReviewBot GitHub App on your repositories to get started.
          </p>
          <a
            href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "reviewbot"}/installations/new`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Install App
          </a>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Connected Repositories</h2>
        <div className="space-y-2">
          {installations.map((inst) => (
            <div
              key={inst.id}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${inst.enabled ? "bg-green-500" : "bg-gray-600"}`}
                />
                <span className="text-sm text-white">{inst.fullName}</span>
              </div>
              <span className={`text-xs ${inst.enabled ? "text-green-400" : "text-gray-500"}`}>
                {inst.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Open a PR on a connected repository.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge status={review.status} severity={review.overallSeverity} />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">
                        {review.repoFullName}#{review.prNumber}
                        {review.prTitle ? ` — ${review.prTitle}` : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 ml-4">
                    {review.status === "completed" ? "✅" : review.status === "failed" ? "❌" : "⏳"}
                  </span>
                </div>
                {review.error && (
                  <p className="mt-1 text-xs text-red-400 truncate">{review.error}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, severity }: { status: string; severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    none: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  const sev = severity?.toLowerCase();
  const className = sev && colors[sev] ? colors[sev] : "bg-gray-800 text-gray-400 border-gray-700";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${className} shrink-0`}>
      {status === "completed" ? (sev || "none").toUpperCase() : status.toUpperCase()}
    </span>
  );
}
