"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/isAdmin";
import {
  createLiveSession,
  updateLiveSession,
  deleteLiveSession,
  getLiveSessionById,
  type LivePlatform,
  type LiveStatus,
  type LiveSessionInput,
} from "@/lib/db/liveSessions";

const PLATFORMS: LivePlatform[] = ["youtube", "facebook", "tiktok"];
const STATUSES: LiveStatus[] = ["scheduled", "live", "ended"];

function parseForm(formData: FormData): LiveSessionInput {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const hostName = String(formData.get("hostName") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const platformRaw = String(formData.get("platform") ?? "youtube");
  const platform: LivePlatform = PLATFORMS.includes(platformRaw as LivePlatform)
    ? (platformRaw as LivePlatform)
    : "youtube";

  const statusRaw = String(formData.get("status") ?? "scheduled");
  const status: LiveStatus = STATUSES.includes(statusRaw as LiveStatus)
    ? (statusRaw as LiveStatus)
    : "scheduled";

  const pinned = formData.getAll("pinnedProductIds").map(String).filter(Boolean);

  return {
    title,
    description: description || null,
    hostName: hostName || null,
    platform,
    videoUrl,
    status,
    pinnedProductIds: pinned,
  };
}

export async function createLiveSessionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const input = parseForm(formData);

  if (!input.title || !input.videoUrl) {
    redirect(
      `/admin/live/new?error=${encodeURIComponent(
        "Vui lòng nhập tiêu đề và link video.",
      )}`,
    );
  }

  await createLiveSession(input);
  revalidatePath("/admin/live");
  revalidatePath("/live");
  redirect("/admin/live");
}

export async function updateLiveSessionAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const input = parseForm(formData);

  if (!input.title || !input.videoUrl) {
    redirect(
      `/admin/live/${id}/edit?error=${encodeURIComponent(
        "Vui lòng nhập tiêu đề và link video.",
      )}`,
    );
  }

  await updateLiveSession(id, input);
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath(`/live/${id}`);
  redirect("/admin/live");
}

export async function deleteLiveSessionAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteLiveSession(id);
  revalidatePath("/admin/live");
  revalidatePath("/live");
}

// Quick status toggle from the admin list (start / end a live).
export async function setLiveStatusAction(
  id: string,
  status: LiveStatus,
): Promise<void> {
  await requireAdmin();
  const session = await getLiveSessionById(id);
  if (!session) throw new Error("Live session not found");

  await updateLiveSession(id, {
    title: session.title,
    description: session.description,
    hostName: session.hostName,
    platform: session.platform,
    videoUrl: session.videoUrl,
    status,
    pinnedProductIds: session.pinnedProductIds,
  });
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath(`/live/${id}`);
}
