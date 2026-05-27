import type { SizeSuggestion } from "@/lib/try-on/claude/schema";
import type { Product } from "@/app/data/products";

interface Props {
  data: SizeSuggestion;
  product?: Product;
  onReset: () => void;
}

export default function SizeSuggestionResult({
  data,
  product,
  onReset,
}: Props) {
  const bar = Math.round(data.fit_percentage);
  const label =
    bar >= 90
      ? "Rất phù hợp"
      : bar >= 75
        ? "Phù hợp"
        : bar >= 60
          ? "Vừa được"
          : "Có thể hơi chật/rộng";

  const sizeChart = product?.tryOn?.sizing?.sizeChart;

  return (
    <div className="space-y-6 ">
      {/* Gop 2 thang div vs p lai cung nhau */}
      <div className="flex gap-10 ">
        <div className="w-1/3 h-full">
          <div className="flex items-center gap-6 border border-black p-6 mb-6">
            <div className="text-center min-w-[5rem]">
              <p className="text-5xl font-black tracking-tight">
                {data.recommended_size}
              </p>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                Size
              </p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-sm font-bold">{bar}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100">
                <div
                  className="h-full bg-black transition-all duration-700"
                  style={{ width: `${bar}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{data.advice}</p>
        </div>

        {sizeChart && sizeChart.length > 0 && (
          <div className="border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">
              Bảng Size (Tham khảo)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 font-semibold border-b">Size</th>
                    <th className="px-3 py-2 font-semibold border-b">
                      Ngực (cm)
                    </th>
                    <th className="px-3 py-2 font-semibold border-b">
                      Eo (cm)
                    </th>
                    {sizeChart.some((s) => s.hipsCm) && (
                      <th className="px-3 py-2 font-semibold border-b">
                        Mông (cm)
                      </th>
                    )}
                    {sizeChart.some((s) => s.lengthCm) && (
                      <th className="px-3 py-2 font-semibold border-b">
                        Dài (cm)
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row) => (
                    <tr
                      key={row.size}
                      className={`border-b last:border-b-0 ${row.size === data.recommended_size ? "bg-gray-100 font-semibold text-black" : ""}`}
                    >
                      <td className="px-3 py-2 border-r">{row.size}</td>
                      <td className="px-3 py-2">
                        {row.chestCm[0]} - {row.chestCm[1]}
                      </td>
                      <td className="px-3 py-2">
                        {row.waistCm[0]} - {row.waistCm[1]}
                      </td>
                      {sizeChart.some((s) => s.hipsCm) && (
                        <td className="px-3 py-2">
                          {row.hipsCm
                            ? `${row.hipsCm[0]} - ${row.hipsCm[1]}`
                            : "-"}
                        </td>
                      )}
                      {sizeChart.some((s) => s.lengthCm) && (
                        <td className="px-3 py-2">{row.lengthCm || "-"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="text-xs uppercase tracking-widest underline hover:no-underline text-gray-500"
      >
        Đo lại
      </button>
    </div>
  );
}
