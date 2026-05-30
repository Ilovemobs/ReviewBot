"use client";

import { useState } from "react";

export default function EmailSignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(null);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(data.link || "sent");
      } else {
        setError(data.error || "failed");
      }
    } catch (err) {
      setError("network_error");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Sign in with Email</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Send magic link</button>
      </form>
      {sent && (
        <p className="mt-3 text-sm text-green-400">Magic link sent. Check logs or: {sent}</p>
      )}
      {error && <p className="mt-3 text-sm text-red-400">Error: {error}</p>}
    </div>
  );
}
