import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  languageName: z.string().min(1).max(40),
});

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the "Jala Rakshana" assistant — a friendly, concise expert on water conservation, rainwater harvesting, and Indian government water schemes (Jal Jeevan Mission, Atal Bhujal Yojana, PMKSY, National Water Mission, Swachh Bharat Mission, Mission Kakatiya, MGNREGA water works).

Rules:
- Always reply in ${data.languageName}. If technical terms have no native word, keep them in English in parentheses.
- Keep replies short and practical (3-6 short bullet points or a brief paragraph).
- When asked about a scheme, mention objective, key benefit, and how to learn more.
- If the user asks something off-topic, gently steer back to water.
- Use simple language that works for students and rural users.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      return { ok: false as const, error: "rate_limited" };
    }
    if (res.status === 402) {
      return { ok: false as const, error: "no_credits" };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text);
      return { ok: false as const, error: "generic" };
    }

    const json = await res.json();
    const reply: string = json?.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, reply };
  });
