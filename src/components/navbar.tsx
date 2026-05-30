"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarProps = {
  user?: {
    login: string;
    avatarUrl: string | null;
    plan: string;
    reviewsUsed: number;
    reviewsLimit: number;
  } | null;
};

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-white">
              ReviewBot
            </Link>
            {user && (
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <Link
                  href="/dashboard"
                  className={`${pathname === "/dashboard" ? "text-blue-400" : "text-gray-400 hover:text-white"} transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className={`${pathname === "/pricing" ? "text-blue-400" : "text-gray-400 hover:text-white"} transition-colors`}
                >
                  Pricing
                </Link>
                <Link
                  href="/settings"
                  className={`${pathname === "/settings" ? "text-blue-400" : "text-gray-400 hover:text-white"} transition-colors`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{user.plan === "free" ? "Free" : "Pro"} plan</p>
                  <p className="text-xs text-gray-500">
                    {user.reviewsUsed}/{user.reviewsLimit} reviews
                  </p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                      {user.login[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/api/auth/login?provider=github"
                  className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="/api/auth/login?provider=google"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Google
                </a>
                <a
                  href="/auth/email"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Email
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
