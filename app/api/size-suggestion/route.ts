import { NextRequest } from "next/server";
import { getGemini, SIZE_SUGGESTION_MODEL } from "@/lib/try-on/claude/client";
// import { getAnthropic, SIZE_SUGGESTION_MODEL } from "@/lib/try-on/claude/client";
import { systemPrompt, userPrompt } from "@/lib/try-on/claude/prompts";
import {
  sizeSuggestionToolSchema,
  sizeSuggestionOutputSchema,
  type SizeSuggestion,
  type SizeSuggestionRequest,
} from "@/lib/try-on/claude/schema";
import { products } from "@/app/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal in-memory rate limiter: 5 requests / minute per IP
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

function fallback(sizeChart: { size: string }[]): SizeSuggestion {
  const mid = sizeChart[Math.floor(sizeChart.length / 2)];
  return {
    recommended_size: mid?.size ?? "M",
    fit_percentage: 70,
    advice:
      "Không thể đưa ra gợi ý chính xác lúc này. Hãy thử lại sau hoặc tham khảo size chart bên dưới.",
  };
}

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
    return Response.json({ error: "Missing productId or measurements" }, { status: 400 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product?.tryOn?.sizing) {
    return Response.json(
      { error: "Product does not have sizing configuration." },
      { status: 400 },
    );
  }

  try {
    const gemini = getGemini();
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

    if (!response.text) {
      return Response.json(fallback(product.tryOn.sizing.sizeChart));
    }

    let rawJson = response.text;
    try {
      rawJson = JSON.parse(response.text);
    } catch {
      // Ignore if already object or parse fails
    }

    const parsed = sizeSuggestionOutputSchema.safeParse(rawJson);
    if (!parsed.success) {
      return Response.json(fallback(product.tryOn.sizing.sizeChart));
    }

    return Response.json(parsed.data);

    /*
    // --- Bỏ comment đoạn này (và comment đoạn Gemini ở trên) nếu muốn dùng lại Claude ---
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: SIZE_SUGGESTION_MODEL,
      max_tokens: 400,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [sizeSuggestionToolSchema],
      tool_choice: { type: "tool", name: sizeSuggestionToolSchema.name },
      messages: [
        {
          role: "user",
          content: userPrompt(product, measurements),
        },
      ],
    });

    const toolUse = message.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return Response.json(fallback(product.tryOn.sizing.sizeChart));
    }

    const parsed = sizeSuggestionOutputSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      return Response.json(fallback(product.tryOn.sizing.sizeChart));
    }

    return Response.json(parsed.data);
    */
  } catch (err) {
    console.error("[size-suggestion] Gemini error:", err);
    return Response.json(fallback(product.tryOn.sizing.sizeChart));
  }
}
