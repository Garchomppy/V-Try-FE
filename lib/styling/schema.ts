import { z } from "zod";

// ─── Model output (raw, references catalog product IDs) ──────────────────────
export const outfitSuggestionOutputSchema = z.object({
  outfits: z
    .array(
      z.object({
        title: z.string().max(80),
        occasion: z.string().max(80),
        itemProductIds: z.array(z.string()).min(1).max(4),
        rationale: z.string().max(400),
      }),
    )
    .min(1)
    .max(3),
});

export type OutfitSuggestionOutput = z.infer<typeof outfitSuggestionOutputSchema>;

// ─── Resolved item the client renders (grounded against the real catalog) ────
export interface OutfitItem {
  id: string;
  name: string;
  price: number;
  discountPercentage: number | null;
  image: string;
}

export interface ResolvedOutfit {
  title: string;
  occasion: string;
  rationale: string;
  items: OutfitItem[];
}

export interface OutfitSuggestionResponse {
  outfits: ResolvedOutfit[];
}

export type OutfitSuggestionRequest = {
  productId: string;
};
