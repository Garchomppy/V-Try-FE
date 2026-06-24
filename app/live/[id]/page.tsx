import { notFound } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { getLiveSessionById } from "@/lib/db/liveSessions";
import { getMessagesBySession } from "@/lib/db/liveMessages";
import { getAllProducts } from "@/lib/db/products";
import type { Product } from "@/lib/types/product";
import type { ProductSummary } from "@/components/styling/MixMatchBuilder";
import LiveRoom from "@/components/live/LiveRoom";

export const dynamic = "force-dynamic";

function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    discountPercentage: p.discountPercentage,
    image: p.images[0] ?? "",
  };
}

export default async function LiveRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getLiveSessionById(id);
  if (!session) notFound();

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  const [messages, catalog] = await Promise.all([
    getMessagesBySession(id),
    getAllProducts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">{session.title}</h1>
        {session.description && (
          <p className="text-sm text-gray-500 mt-1">{session.description}</p>
        )}
      </div>

      <LiveRoom
        sessionId={session.id}
        initialSession={{
          platform: session.platform,
          videoUrl: session.videoUrl,
          status: session.status,
          pinnedProductIds: session.pinnedProductIds,
        }}
        catalog={catalog.map(toSummary)}
        initialMessages={messages}
        isAuthed={Boolean(data.user)}
      />
    </div>
  );
}
