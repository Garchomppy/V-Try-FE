import { NextRequest } from "next/server";
import {
  getGemini,
  SIZE_SUGGESTION_MODEL,
  getGroqApiKey,
  GROQ_API_BASE,
  GROQ_MODEL,
} from "@/lib/try-on/claude/client";
import { systemPrompt, userPrompt } from "@/lib/styling/prompts";
import {
  outfitSuggestionOutputSchema,
  type OutfitSuggestionOutput,
  type OutfitSuggestionRequest,
  type OutfitSuggestionResponse,
  type OutfitItem,
} from "@/lib/styling/schema";
import { getAllProducts } from "@/lib/db/products";
import type { Product } from "@/lib/types/product";

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toItem(p: Product): OutfitItem {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    discountPercentage: p.discountPercentage,
    image: p.images[0] ?? "",
  };
}

// ─── Resolve model output (IDs) against the real catalog, dropping bad IDs ────
function resolveOutfits(
  output: OutfitSuggestionOutput,
  byId: Map<string, Product>,
  targetId: string,
): OutfitSuggestionResponse {
  const outfits = output.outfits
    .map((o) => {
      const items = o.itemProductIds
        .filter((id) => id !== targetId)
        .map((id) => byId.get(id))
        .filter((p): p is Product => Boolean(p))
        .map(toItem);
      return { title: o.title, occasion: o.occasion, rationale: o.rationale, items };
    })
    .filter((o) => o.items.length > 0);
  return { outfits };
}

// ─── Static fallback: one outfit with up to 3 other products ─────────────────
function staticFallback(
  catalog: Product[],
  targetId: string,
): OutfitSuggestionResponse {
  const items = catalog
    .filter((p) => p.id !== targetId)
    .slice(0, 3)
    .map(toItem);
  if (items.length === 0) return { outfits: [] };
  return {
    outfits: [
      {
        title: "Gợi ý phối cùng",
        occasion: "Hằng ngày",
        rationale:
          "Một vài món trong cửa hàng có thể kết hợp cùng sản phẩm này. Thử mix & match theo phong cách của bạn.",
        items,
      },
    ],
  };
}

// ─── Gemini ──────────────────────────────────────────────────────────────────
async function callGemini(
  target: Product,
  catalog: Product[],
): Promise<OutfitSuggestionOutput | null> {
  const gemini = getGemini();
  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: SIZE_SUGGESTION_MODEL,
        contents: userPrompt(target, catalog),
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              outfits: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    occasion: { type: "STRING" },
                    itemProductIds: { type: "ARRAY", items: { type: "STRING" } },
                    rationale: { type: "STRING" },
                  },
                  required: ["title", "occasion", "itemProductIds", "rationale"],
                },
              },
            },
            required: ["outfits"],
          },
        },
      });

      if (!response.text) return null;
      let rawJson: unknown = response.text;
      try { rawJson = JSON.parse(response.text); } catch { /* already object */ }

      const parsed = outfitSuggestionOutputSchema.safeParse(rawJson);
      return parsed.success ? parsed.data : null;
    } catch (err: unknown) {
      const e = err as { status?: number; error?: { code?: number } };
      const status = e?.status ?? e?.error?.code;
      const isTransient = status === 503 || status === 429;
      if (isTransient && attempt < MAX_RETRIES - 1) {
        await sleep(1500);
        continue;
      }
      throw err;
    }
  }
  return null;
}

// ─── Groq fallback (OpenAI-compatible) ───────────────────────────────────────
async function callGroq(
  target: Product,
  catalog: Product[],
): Promise<OutfitSuggestionOutput | null> {
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
            userPrompt(target, catalog) +
            '\n\nRespond ONLY with a JSON object: {"outfits": [{"title": string, "occasion": string, "itemProductIds": string[], "rationale": string}]}',
        },
      ],
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let rawJson: unknown;
  try { rawJson = JSON.parse(jsonMatch[0]); } catch { return null; }

  const parsed = outfitSuggestionOutputSchema.safeParse(rawJson);
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

  let body: OutfitSuggestionRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.productId) {
    return Response.json({ error: "Missing productId" }, { status: 400 });
  }

  const catalog = await getAllProducts();
  const target = catalog.find((p) => p.id === body.productId);
  if (!target) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const byId = new Map(catalog.map((p) => [p.id, p]));
  const candidates = catalog.filter((p) => p.id !== target.id);

  // Not enough other products to compose an outfit.
  if (candidates.length === 0) {
    return Response.json({ outfits: [] } satisfies OutfitSuggestionResponse);
  }

  // Tier 1: Gemini
  try {
    const result = await callGemini(target, candidates);
    if (result) {
      const resolved = resolveOutfits(result, byId, target.id);
      if (resolved.outfits.length > 0) return Response.json(resolved);
    }
  } catch (err) {
    console.warn("[outfit-suggestion] Gemini failed → trying Groq:", (err as Error).message);
  }

  // Tier 2: Groq
  try {
    const result = await callGroq(target, candidates);
    if (result) {
      const resolved = resolveOutfits(result, byId, target.id);
      if (resolved.outfits.length > 0) return Response.json(resolved);
    }
  } catch (err) {
    console.error("[outfit-suggestion] Groq also failed:", (err as Error).message);
  }

  // Tier 3: Static fallback
  return Response.json(staticFallback(catalog, target.id));
}
