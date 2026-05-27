import { z } from "zod";

export const sizeSuggestionToolSchema = {
  name: "return_size_recommendation",
  description:
    "Return a structured size recommendation based on the user's measurements and the product's size chart.",
  input_schema: {
    type: "object" as const,
    required: ["recommended_size", "fit_percentage", "advice"],
    properties: {
      recommended_size: {
        type: "string",
        description: "Recommended size code from the product's size chart.",
      },
      fit_percentage: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Estimated fit match as a percentage (0-100).",
      },
      advice: {
        type: "string",
        maxLength: 240,
        description:
          "Short, practical advice about the fit (in Vietnamese or English, max 240 chars).",
      },
    },
  },
};

export const sizeSuggestionOutputSchema = z.object({
  recommended_size: z.string(),
  fit_percentage: z.number().min(0).max(100),
  advice: z.string().max(320),
});

export type SizeSuggestion = z.infer<typeof sizeSuggestionOutputSchema>;

export type SizeSuggestionRequest = {
  productId: string;
  measurements: {
    heightCm: number;
    weightKg: number;
    chestCm: number;
    waistCm: number;
    hipsCm?: number;
  };
};
