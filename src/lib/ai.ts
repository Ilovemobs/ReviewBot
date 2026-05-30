import Groq from "groq-sdk";
import { getEnv } from "./env";

const groq = new Groq({
  apiKey: getEnv("GROQ_API_KEY"),
});

const MODEL = "llama-3.3-70b-versatile";

export type AIProvider = "groq";

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.1,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in AI response");
      return "{}";
    }

    return content;
  } catch (err) {
    console.error("AI API error:", err);
    throw new Error(`AI service error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
