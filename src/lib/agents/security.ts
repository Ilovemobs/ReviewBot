import { callAI } from "../ai";

const SYSTEM = `You are a security code review expert. Analyze the provided diff and find security issues.
Return a JSON object with this structure:
{
  "findings": [
    {
      "file": "path/to/file",
      "line": 42,
      "severity": "critical" | "high" | "medium" | "low",
      "category": "sql-injection" | "xss" | "auth-bypass" | "secrets-exposed" | "command-injection" | "path-traversal" | "insecure-crypto" | "csrf" | "ssrf" | "dependency-risk" | "other",
      "title": "Short title",
      "description": "Detailed explanation of the issue",
      "suggestion": "How to fix it with code example"
    }
  ]
}

Focus on: SQL injection, XSS, hardcoded secrets, auth issues, command injection, path traversal, insecure crypto, CSRF, SSRF.
Only report real, impactful issues. Be precise about file and line numbers. Return empty array if no issues.`;

export async function securityReview(diff: string) {
  const raw = await callAI(SYSTEM, `Review this diff for security issues:\n\n${diff}`);
  try {
    return JSON.parse(raw);
  } catch {
    return { findings: [] };
  }
}
