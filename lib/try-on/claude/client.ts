import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local — see .env.local.example.",
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const SIZE_SUGGESTION_MODEL = "claude-haiku-4-5";
