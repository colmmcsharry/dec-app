import { MODULE_VIDEOS } from "@/data/module-videos";

/**
 * First video in each module is free for non‑Pro users.
 * Later videos (and chaining) still require Pro.
 */
export function isFreePreviewVideo(
  categorySlug: string | undefined,
  videoId: string | undefined,
): boolean {
  if (!categorySlug || !videoId) return false;
  const first = MODULE_VIDEOS[categorySlug]?.[0];
  return !!first && first.id === videoId;
}
