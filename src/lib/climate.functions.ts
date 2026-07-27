import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  languageName: z.string().min(1).max(40),
  place: z.string().min(1).max(120),
  season: z.string().min(1).max(40),
  temperature: z.number(),
  humidity: z.number(),
  rainToday: z.number(),
  rainWeek: z.number(),
  windSpeed: z.number(),
  uv: z.number(),
  aqi: z.number().nullable(),
  alerts: z.array(z.string()).max(10),
  roofArea: z.number().min(1).max(5000),
});

export interface ClimateAdvice {
  summary: string;
  harvesting: string[];
  conservation: string[];
  agriculture: {
    crops: string[];
    sowing: string;
    harvesting: string;
    irrigation: string;
    protection: string;
  };
  precautions: string[];
}

export const getClimateAdvice = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are the Jala Rakshana Climate Advisor for India. Give practical, location-aware guidance.

Location: ${data.place}
Season: ${data.season}
Temperature: ${data.temperature}°C, Humidity: ${data.humidity}%, Wind: ${data.windSpeed} km/h, UV: ${data.uv}
Rain today: ${data.rainToday} mm, Rain next 7 days: ${data.rainWeek} mm
Air quality index: ${data.aqi ?? "unknown"}
Active alerts: ${data.alerts.length ? data.alerts.join("; ") : "none"}
User roof area for rainwater harvesting: ${data.roofArea} m²

Write everything in ${data.languageName}. Keep each item one short sentence (max 18 words). Be specific to these numbers.
Return JSON with exactly this shape:
{"summary":string,"harvesting":[3 strings],"conservation":[4 strings],"agriculture":{"crops":[3-5 crop names],"sowing":string,"harvesting":string,"irrigation":string,"protection":string},"precautions":[2-4 strings]}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) return { ok: false as const, error: "rate_limited" };
    if (res.status === 402) return { ok: false as const, error: "no_credits" };
    if (!res.ok) {
      console.error("climate advice error", res.status, await res.text().catch(() => ""));
      return { ok: false as const, error: "generic" };
    }

    const json = await res.json();
    const raw: string = json?.choices?.[0]?.message?.content ?? "";
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
      return { ok: true as const, advice: JSON.parse(cleaned) as ClimateAdvice };
    } catch {
      return { ok: false as const, error: "generic" };
    }
  });
