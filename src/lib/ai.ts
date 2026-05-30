import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODEL = "llama-3.3-70b-versatile";

export type AIProvider = "groq";

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
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

  return completion.choices[0]?.message?.content || "{}";
}
