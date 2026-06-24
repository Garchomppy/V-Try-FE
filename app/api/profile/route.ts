import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  try {
    await updateProfile(data.user.id, {
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
