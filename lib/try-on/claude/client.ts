import { GoogleGenAI } from "@google/genai";
// import Anthropic from "@anthropic-ai/sdk";

let cached: GoogleGenAI | null = null;
// let cachedAnthropic: Anthropic | null = null;

export function getGemini(): GoogleGenAI {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY; // The user used this env var name
  if (!apiKey) {
    throw new Error("API key is not set. Add it to .env.local.");
  }
  cached = new GoogleGenAI({ apiKey });
  return cached;
}

/*
// Bỏ comment đoạn này nếu muốn dùng lại Claude
export function getAnthropic(): Anthropic {
  if (cachedAnthropic) return cachedAnthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local.",
    );
  }
  cachedAnthropic = new Anthropic({ apiKey });
  return cachedAnthropic;
}
*/

export const SIZE_SUGGESTION_MODEL = "gemini-2.5-flash";
// export const SIZE_SUGGESTION_MODEL = "claude-3-haiku-20240307";
