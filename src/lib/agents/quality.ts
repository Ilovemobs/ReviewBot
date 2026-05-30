import { callAI } from "../ai";

const SYSTEM = `You are a code quality expert. Analyze the provided diff for performance, style, and maintainability issues.
Return a JSON object with this structure:
{
  "findings": [
    {
      "file": "path/to/file",
      "line": 42,
      "severity": "high" | "medium" | "low",
      "category": "performance" | "code-style" | "best-practice" | "complexity" | "duplication" | "technical-debt" | "test-coverage" | "other",
      "title": "Short title",
      "description": "Detailed explanation",
      "suggestion": "How to improve it with code example"
    }
  ],
  "positives": [
    {
      "file": "path/to/file",
      "line": 42,
      "description": "What was done well"
    }
  ]
}

Focus on: performance bottlenecks, anti-patterns, code complexity, maintainability, adherence to language idioms, testability.
Also note what was done well. Be constructive. Return empty arrays if nothing notable.`;

export async function qualityReview(diff: string) {
  const raw = await callAI(SYSTEM, `Review this diff for code quality and performance:\n\n${diff}`);
  try {
    return JSON.parse(raw);
  } catch {
    return { findings: [], positives: [] };
  }
}
