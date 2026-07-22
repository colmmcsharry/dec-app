import { MODULE_ORDER } from "@/constants/module-themes";
import { MODULE_VIDEOS } from "@/data/module-videos";

/** First module in canonical order (Module 1 — Sleep). */
export const FREE_PREVIEW_MODULE_SLUG = MODULE_ORDER[0];

/** First video in that module (free preview for non‑Pro users). */
export const FREE_PREVIEW_VIDEO_ID =
  MODULE_VIDEOS[FREE_PREVIEW_MODULE_SLUG][0]?.id ?? "";

export function isFreePreviewVideo(
  categorySlug: string | undefined,
  videoId: string | undefined,
): boolean {
  if (!categorySlug || !videoId || !FREE_PREVIEW_VIDEO_ID) return false;
  return (
    categorySlug === FREE_PREVIEW_MODULE_SLUG &&
    videoId === FREE_PREVIEW_VIDEO_ID
  );
}
