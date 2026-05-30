import { getSession } from "@/lib/auth";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individual developers getting started",
    features: [
      "5 reviews per month",
      "3 AI agents (security, bugs, quality)",
      "GitHub PR integration",
      "Inline comments on PRs",
      "Basic severity reporting",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professional teams shipping daily",
    features: [
      "Unlimited reviews",
      "Priority queue (fast reviews)",
      "Custom review rules",
      "Team dashboard",
      "Email reports",
      "Review history & analytics",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For organizations at scale",
    features: [
      "Everything in Pro",
      "Unlimited team seats",
      "Custom AI model (bring your own)",
      "SSO / SAML",
      "Audit logs",
      "99.9% SLA",
      "Dedicated support",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default async function PricingPage() {
  const session = await getSession();

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 text-lg">
          Start free. Upgrade when you need more reviews.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 flex flex-col ${
              plan.highlighted
                ? "bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/20"
                : "bg-gray-900 border-gray-800"
            }`}
          >
            <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-gray-400">/{plan.period}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{plan.description}</p>

            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4 mt-0.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {session ? (
                plan.name === "Free" ? (
                  <div className="text-center text-sm text-gray-500 py-3 border border-gray-700 rounded-lg">
                    Current Plan
                  </div>
                ) : (
                  <a
                    href={plan.name === "Enterprise" ? "mailto:sales@reviewbot.dev" : "#"}
                    className={`block text-center font-medium py-3 rounded-lg text-sm transition-colors ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    }`}
                  >
                    {plan.cta}
                  </a>
                )
              ) : (
                <a
                  href="/api/auth/login"
                  className={`block text-center font-medium py-3 rounded-lg text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  }`}
                >
                  Sign in to get started
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          {[
            { q: "How does the free tier work?", a: "You get 5 reviews per month with full access to all 3 AI agents. No credit card required." },
            { q: "What happens when I hit my limit?", a: "Reviews will be queued until your limit resets, or you can upgrade to Pro for unlimited reviews." },
            { q: "Is my code safe?", a: "Code is sent to Groq's API for analysis. We do not store your code. See our privacy policy for details." },
            { q: "Can I cancel anytime?", a: "Yes. You can downgrade or cancel at any time. No lock-in contracts." },
          ].map((faq) => (
            <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-1">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
