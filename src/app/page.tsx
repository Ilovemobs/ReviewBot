import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold">ReviewBot</span>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
              <a
                href="/api/auth/login?provider=github"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign in with GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-500/20">
            AI-Powered Code Review
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Catch bugs, security issues, and bad code{" "}
            <span className="text-blue-400">before they ship</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            ReviewBot automatically reviews every pull request in your GitHub repositories.
            Three specialized AI agents analyze security, bugs, and code quality in parallel.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/api/auth/login?provider=github"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Get Started Free
            </a>
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              See Pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required. 5 free reviews/month.</p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "Security Scanning",
                desc: "Detects SQL injection, XSS, hardcoded secrets, auth bypasses, and OWASP Top 10 vulnerabilities.",
                icon: "🛡️",
              },
              {
                title: "Bug Detection",
                desc: "Finds null pointers, race conditions, logic errors, edge cases, and error handling gaps.",
                icon: "🐛",
              },
              {
                title: "Quality Analysis",
                desc: "Reviews performance, code style, complexity, best practices, and technical debt.",
                icon: "⭐",
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Install App", desc: "Install ReviewBot on your GitHub repositories" },
              { step: "2", title: "Open a PR", desc: "Create or update a pull request as usual" },
              { step: "3", title: "Auto-Review", desc: "3 AI agents scan your diff in seconds" },
              { step: "4", title: "Get Feedback", desc: "Inline comments & summary appear on your PR" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
          ReviewBot — AI Code Review Agent. Built with ❤️
        </footer>
      </main>
    </div>
  );
}
