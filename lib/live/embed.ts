import type { LivePlatform } from "@/lib/db/liveSessions";

// Convert a public stream URL into an embeddable iframe `src`.
// Falls back to the raw URL when a platform-specific transform is unavailable.
export function toEmbedUrl(platform: LivePlatform, rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) return "";

  switch (platform) {
    case "youtube":
      return youtubeEmbed(url);
    case "facebook":
      return facebookEmbed(url);
    case "tiktok":
      return url; // TikTok: paste the player/embed URL directly.
    default:
      return url;
  }
}

function youtubeEmbed(url: string): string {
  // Already an embed URL.
  if (url.includes("/embed/")) return url;

  let id = "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.searchParams.get("v")) {
      id = u.searchParams.get("v") ?? "";
    } else if (u.pathname.includes("/live/")) {
      id = u.pathname.split("/live/")[1]?.split("/")[0] ?? "";
    } else if (u.pathname.includes("/shorts/")) {
      id = u.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
    }
  } catch {
    return url;
  }

  return id ? `https://www.youtube.com/embed/${id}` : url;
}

function facebookEmbed(url: string): string {
  if (url.includes("/plugins/video.php")) return url;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    url,
  )}&show_text=false&autoplay=true`;
}
