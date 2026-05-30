import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewBot — AI Code Review Agent",
  description: "Automated AI code reviews for your GitHub pull requests. Catch bugs, security issues, and style problems before they ship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
