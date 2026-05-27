import type { Product } from "@/app/data/products";
import type { SizeSuggestionRequest } from "./schema";

export const systemPrompt = `Bạn là AI tư vấn size thời trang chuyên nghiệp. Nhiệm vụ của bạn là đề xuất size phù hợp nhất cho người dùng dựa trên thông số cơ thể và size chart sản phẩm.

Quy tắc:
- Chỉ đề xuất các size có trong size chart được cung cấp.
- fit_percentage phản ánh mức độ phù hợp thực sự (không phải marketing), dựa trên sai số giữa số đo người dùng và khoảng size chart.
- Nếu số đo nằm giữa 2 size, chọn size lớn hơn và ghi chú trong advice.
- Phom dáng slim-fit được recommend chặt hơn, oversized được recommend rộng hơn.
- Advice ngắn gọn, thiết thực, tối đa 240 ký tự.`;

export function userPrompt(
  product: Product,
  measurements: SizeSuggestionRequest["measurements"],
): string {
  const sizing = product.tryOn?.sizing;
  if (!sizing) throw new Error("Product has no sizing config");

  return `Thông số người dùng:
- Chiều cao: ${measurements.heightCm}cm
- Cân nặng: ${measurements.weightKg}kg
- Vòng ngực: ${measurements.chestCm}cm
- Vòng eo: ${measurements.waistCm}cm${measurements.hipsCm ? `\n- Vòng mông: ${measurements.hipsCm}cm` : ""}

Sản phẩm: ${product.name}
Phom dáng: ${sizing.fit}

Size chart sản phẩm:
${JSON.stringify(sizing.sizeChart, null, 2)}

Đề xuất size phù hợp nhất và giải thích ngắn gọn.`;
}
