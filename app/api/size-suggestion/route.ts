import { NextRequest } from "next/server";
import {
  getGemini,
  SIZE_SUGGESTION_MODEL,
  getGroqApiKey,
  GROQ_API_BASE,
  GROQ_MODEL,
} from "@/lib/try-on/claude/client";
import { systemPrompt, userPrompt } from "@/lib/try-on/claude/prompts";
import {
  sizeSuggestionOutputSchema,
  type SizeSuggestion,
  type SizeSuggestionRequest,
} from "@/lib/try-on/claude/schema";
import { getProductById } from "@/lib/db/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Rate limiter: 5 requests / minute per IP ───────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// ─── Static fallback ─────────────────────────────────────────────────────────
function staticFallback(sizeChart: { size: string }[]): SizeSuggestion {
  const mid = sizeChart[Math.floor(sizeChart.length / 2)];
  return {
    recommended_size: mid?.size ?? "M",
    fit_percentage: 70,
    advice:
      "Không thể đưa ra gợi ý chính xác lúc này. Hãy thử lại sau hoặc tham khảo size chart bên dưới.",
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Gemini with exponential-backoff retry ───────────────────────────────────
async function callGemini(
  product: Parameters<typeof userPrompt>[0],
  measurements: Parameters<typeof userPrompt>[1],
): Promise<SizeSuggestion | null> {
  const gemini = getGemini();
  const MAX_RETRIES = 2; // Fail fast so Groq can take over quickly

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: SIZE_SUGGESTION_MODEL,
        contents: userPrompt(product, measurements),
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              recommended_size: { type: "STRING" },
              fit_percentage: { type: "NUMBER" },
              advice: { type: "STRING" },
            },
            required: ["recommended_size", "fit_percentage", "advice"],
          },
        },
      });

      if (!response.text) return null;

      let rawJson: unknown = response.text;
      try { rawJson = JSON.parse(response.text); } catch { /* already object */ }

      const parsed = sizeSuggestionOutputSchema.safeParse(rawJson);
      return parsed.success ? parsed.data : null;
    } catch (err: any) {
      const status = err?.status ?? err?.error?.code;
      const isTransient = status === 503 || status === 429;

      if (isTransient && attempt < MAX_RETRIES - 1) {
        const delay = 1500; // 1.5s single retry — then hand off to Groq
        console.warn(`[size-suggestion] Gemini ${status} – retry in ${delay}ms`);
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }
  return null;
}

// ─── Groq via OpenAI-compatible API (free tier, no package needed) ────────────
async function callGroq(
  product: Parameters<typeof userPrompt>[0],
  measurements: Parameters<typeof userPrompt>[1],
): Promise<SizeSuggestion | null> {
  const apiKey = getGroqApiKey();

  const res = await fetch(`${GROQ_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            userPrompt(product, measurements) +
            "\n\nRespond ONLY with a JSON object: {\"recommended_size\": string, \"fit_percentage\": number, \"advice\": string}",
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  // Extract JSON from potential markdown code block
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let rawJson: unknown;
  try { rawJson = JSON.parse(jsonMatch[0]); } catch { return null; }

  const parsed = sizeSuggestionOutputSchema.safeParse(rawJson);
  return parsed.success ? parsed.data : null;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
      { status: 429 },
    );
  }

  let body: SizeSuggestionRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, measurements } = body;
  if (!productId || !measurements) {
    return Response.json(
      { error: "Missing productId or measurements" },
      { status: 400 },
    );
  }

  const product = await getProductById(productId);
  if (!product?.tryOn?.sizing) {
    return Response.json(
      { error: "Product does not have sizing configuration." },
      { status: 400 },
    );
  }

  // Tier 1: Gemini (with 1 retry then fail fast)
  try {
    const result = await callGemini(product, measurements);
    if (result) return Response.json(result);
  } catch (err) {
    console.warn("[size-suggestion] Gemini failed → trying Groq:", (err as Error).message);
  }

  // Tier 2: Groq (free, fast)
  try {
    const result = await callGroq(product, measurements);
    if (result) {
      console.log("[size-suggestion] Groq responded successfully.");
      return Response.json(result);
    }
  } catch (err) {
    console.error("[size-suggestion] Groq also failed:", (err as Error).message);
  }

  // Tier 3: Static fallback
  return Response.json(staticFallback(product.tryOn.sizing.sizeChart));
}
