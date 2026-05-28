/**
 * /api/virtual-tryon — IDM-VTON proxy (Hugging Face Spaces)
 *
 * Receives:
 *   - personImageBase64: JPEG snapshot from webcam canvas (base64, no prefix)
 *   - garmentId: one of the GARMENT_IDs defined below (maps to a PNG file)
 *   - garmentDescription: text description for the model
 *
 * Calls IDM-VTON on HF Spaces via @gradio/client.
 * Returns: { resultUrl: string (data URL) } or { fallback: true, error: string }
 *
 * No API key needed — IDM-VTON is free on HF ZeroGPU (shared).
 * Expect 30–90s per request due to GPU queue.
 */

import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";
import fs from "fs";
import path from "path";

// Map garment IDs to their public PNG paths (server-side absolute paths)
const GARMENT_FILES: Record<string, string> = {
  "white-tee":    "p1-white-tee.png",
  "hoodie":       "p2-hoodie.png",
  "sweatshirt":   "p3-sweatshirt.png",
  "denim-jacket": "p4-denim-jacket.png",
};

// In-memory simple rate limiter — 2 req/min per IP (IDM-VTON is slow, no need for more)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 2) return false;
  entry.count++;
  return true;
}

export const maxDuration = 120; // Next.js serverless max seconds

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { fallback: true, error: "Đang xử lý ảnh trước, vui lòng chờ 1 phút." },
      { status: 429 },
    );
  }

  // Parse body
  let personImageBase64: string;
  let garmentId: string;
  let garmentDescription: string;
  let garmentImageBase64: string | undefined;
  try {
    ({ personImageBase64, garmentId, garmentDescription, garmentImageBase64 } = await req.json());
    if (!personImageBase64 || !garmentId) throw new Error("Missing fields");
  } catch {
    return NextResponse.json(
      { fallback: true, error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Convert person base64 → Blob
  const personBuffer = Buffer.from(personImageBase64, "base64");
  const personBlob = new Blob([personBuffer], { type: "image/jpeg" });

  // Get garment Blob (from client base64 or server local fallback)
  let garmentBlob: Blob;
  if (garmentImageBase64) {
    console.log(`[virtual-tryon] Using client-provided garment image (composited white background) for: ${garmentId}`);
    const garmentBuffer = Buffer.from(garmentImageBase64, "base64");
    garmentBlob = new Blob([garmentBuffer], { type: "image/jpeg" });
  } else {
    console.log(`[virtual-tryon] Falling back to server garment file for: ${garmentId}`);
    const garmentFileName = GARMENT_FILES[garmentId];
    if (!garmentFileName) {
      return NextResponse.json(
        { fallback: true, error: `Unknown garment ID: ${garmentId}` },
        { status: 400 },
      );
    }

    const garmentPath = path.join(
      process.cwd(),
      "public",
      "try-on",
      "overlays",
      garmentFileName,
    );

    if (!fs.existsSync(garmentPath)) {
      console.error("[virtual-tryon] Garment file not found:", garmentPath);
      return NextResponse.json(
        { fallback: true, error: "Garment file not found on server" },
        { status: 500 },
      );
    }

    const garmentBuffer = fs.readFileSync(garmentPath);
    garmentBlob = new Blob([garmentBuffer], { type: "image/png" });
  }

  // Attempt the Gradio predict with reconnect retry for session expiry errors
  const MAX_ATTEMPTS = 2;

  async function runPredict(personBlob: Blob, garmentBlob: Blob) {
    const client = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On", {
      events: ["log", "status"],
    });

    // Kwai-Kolors/Kolors-Virtual-Try-On Endpoint 2 accepts:
    // [Person Image, Garment Image, Seed (number), Random Seed (boolean)]
    const result = await client.predict(2, [
      handle_file(personBlob),
      handle_file(garmentBlob),
      42,
      true,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result.data as any[];
    const outputImage = data?.[0];
    if (!outputImage) throw new Error("Kolors Virtual Try-On returned no output image");

    if (typeof outputImage === "string") return outputImage;
    if (outputImage?.url) return outputImage.url as string;
    if (outputImage?.path) return outputImage.path as string;
    throw new Error("Unexpected output format from Kolors Virtual Try-On");
  }

  try {
    let imageUrl: string | undefined;
    let lastErr: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`[virtual-tryon] Connecting to Kwai-Kolors/Kolors-Virtual-Try-On (attempt ${attempt}/${MAX_ATTEMPTS}) for garment: ${garmentId}`);
        imageUrl = await runPredict(personBlob, garmentBlob);
        break;
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        // Retry only on session expiry / socket close — these are transient cold-start failures
        const isRetryable =
          msg.includes("Session not found") ||
          msg.includes("terminated") ||
          msg.includes("socket") ||
          msg.includes("UND_ERR");
        if (!isRetryable || attempt === MAX_ATTEMPTS) throw err;
        console.warn(`[virtual-tryon] Retryable error on attempt ${attempt}: ${msg} — reconnecting...`);
      }
    }

    if (!imageUrl) throw lastErr;

    // If it's a remote URL, fetch and convert to base64 data URL
    // so the client doesn't need to handle CORS
    let resultUrl: string;
    if (imageUrl.startsWith("http")) {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Failed to fetch result image: ${imgRes.status}`);
      const imgBuf = await imgRes.arrayBuffer();
      const imgB64 = Buffer.from(imgBuf).toString("base64");
      const mimeType = imgRes.headers.get("content-type") ?? "image/png";
      resultUrl = `data:${mimeType};base64,${imgB64}`;
    } else {
      resultUrl = imageUrl;
    }

    console.log("[virtual-tryon] ✓ Kolors Virtual Try-On success");
    return NextResponse.json({ resultUrl, fallback: false });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[virtual-tryon] Kolors Virtual Try-On error:", msg);

    return NextResponse.json(
      {
        fallback: true,
        error: "AI Try-On tạm thời không khả dụng (HF Spaces đang bận). Thử lại sau ít phút.",
      },
      { status: 503 },
    );
  }
}
