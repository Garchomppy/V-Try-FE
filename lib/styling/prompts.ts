import type { Product } from "@/lib/types/product";

export const systemPrompt = `Bạn là AI stylist thời trang chuyên nghiệp cho một cửa hàng online. Nhiệm vụ: gợi ý cách phối đồ ("complete the look") cho một sản phẩm chính, chỉ dùng các sản phẩm có sẵn trong catalog được cung cấp.

Quy tắc:
- Sản phẩm chính LUÔN nằm trong outfit, nên KHÔNG đưa id của nó vào itemProductIds. itemProductIds chỉ gồm các sản phẩm BỔ TRỢ.
- Chỉ được chọn id có thật trong danh sách catalog. Tuyệt đối không bịa id.
- Mỗi outfit gồm 1-3 món bổ trợ, hài hòa về phong cách, tông màu và dịp sử dụng.
- Tạo 1-2 outfit cho các dịp khác nhau (vd: đi làm, dạo phố, dự tiệc).
- rationale: giải thích ngắn gọn bằng tiếng Việt vì sao cách phối này đẹp (tối đa 400 ký tự).
- title ngắn gọn, hấp dẫn (vd "Phố ngày cuối tuần").`;

export function userPrompt(target: Product, catalog: Product[]): string {
  const catalogLines = catalog
    .map(
      (p) =>
        `- id="${p.id}" | ${p.name} | $${p.price} | ${p.description.slice(0, 120)}`,
    )
    .join("\n");

  return `Sản phẩm chính cần phối đồ:
id="${target.id}" | ${target.name} | $${target.price}
Mô tả: ${target.description.slice(0, 240)}

Catalog các sản phẩm bổ trợ có thể chọn (CHỈ chọn id trong danh sách này):
${catalogLines}

Hãy tạo 1-2 outfit phối với sản phẩm chính, mỗi outfit 1-3 món bổ trợ từ catalog.`;
}
