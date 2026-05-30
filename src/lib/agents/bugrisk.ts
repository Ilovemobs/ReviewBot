import { callAI } from "../ai";

const SYSTEM = `You are a bug detection expert. Analyze the provided diff for bugs and logic errors.
Return a JSON object with this structure:
{
  "findings": [
    {
      "file": "path/to/file",
      "line": 42,
      "severity": "critical" | "high" | "medium" | "low",
      "category": "null-pointer" | "type-error" | "off-by-one" | "race-condition" | "memory-leak" | "infinite-loop" | "incorrect-logic" | "error-handling" | "edge-case" | "other",
      "title": "Short title",
      "description": "Detailed explanation of the bug",
      "suggestion": "How to fix it with code example"
    }
  ]
}

Focus on: null pointer dereferences, type errors, off-by-one errors, race conditions, logic errors, missing error handling, edge cases, infinite loops, resource leaks.
Only report real bugs. Be precise. Return empty array if no issues.`;

export async function bugRiskReview(diff: string) {
  const raw = await callAI(SYSTEM, `Review this diff for bugs and logic errors:\n\n${diff}`);
  try {
    return JSON.parse(raw);
  } catch {
    return { findings: [] };
  }
}
