import { getSession, refreshUserFromDb } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const fresh = await refreshUserFromDb(session);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">GitHub Username</label>
            <p className="text-white">{fresh.login}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <p className="text-white">{fresh.email || "Not available"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Plan</label>
            <p className="text-white capitalize">{fresh.plan}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usage</h2>
        <div>
          <p className="text-sm text-gray-400 mb-1">
            Reviews used this month: {fresh.reviewsUsed} / {fresh.reviewsLimit}
          </p>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                fresh.reviewsUsed >= fresh.reviewsLimit ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min((fresh.reviewsUsed / fresh.reviewsLimit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Integration</h2>
        <p className="text-sm text-gray-400 mb-4">
          To enable ReviewBot on your repositories, install the GitHub App.
        </p>
        <a
          href={`https://github.com/apps/${
            process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "reviewbot"
          }/installations/new`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Configure Installations
        </a>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
        <a
          href="/api/auth/logout"
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Sign out of ReviewBot
        </a>
      </div>
    </div>
  );
}
