import Link from "next/link";
import { Radio } from "lucide-react";

import { getVisibleLiveSessions } from "@/lib/db/liveSessions";

export const dynamic = "force-dynamic";

export default async function LiveListPage() {
  const sessions = await getVisibleLiveSessions();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-6 h-6 text-red-600" />
        <h1 className="text-2xl font-bold uppercase tracking-widest">Live Shopping</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">
        Xem livestream và mua sắm trực tiếp cùng shop.
      </p>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Radio className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">Hiện chưa có phiên live nào. Quay lại sau nhé!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/live/${s.id}`}
              className="group border border-gray-200 hover:border-black transition-colors"
            >
              <div className="relative aspect-video w-full bg-gray-900 flex items-center justify-center">
                <Radio className="w-10 h-10 text-white/30" />
                {s.status === "live" ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Live
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                    Sắp diễn ra
                  </span>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-sm font-bold uppercase tracking-wide line-clamp-1 group-hover:text-[#FF6F61]">
                  {s.title}
                </h2>
                {s.hostName && (
                  <p className="text-xs text-gray-500 mt-1">Host: {s.hostName}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
