import { MODULE_ORDER } from "@/constants/module-themes";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { SUPPLEMENTAL_RESOURCES } from "@/data/supplemental-resources";

/** Modules 1–2 are free for everyone (videos, workbooks, lesson resources). */
export const FREE_MODULE_SLUGS = [
  MODULE_ORDER[0], // sleep
  MODULE_ORDER[1], // morning-routines
] as const;

const FREE_MODULE_SET = new Set<string>(FREE_MODULE_SLUGS);

export function isFreeModule(slug: string | undefined): boolean {
  return Boolean(slug && FREE_MODULE_SET.has(slug));
}

/**
 * Any lesson in a free module is unlocked for non‑Pro users.
 * Modules 3–10 still require Pro.
 */
export function isFreePreviewVideo(
  categorySlug: string | undefined,
  videoId: string | undefined,
): boolean {
  if (!categorySlug || !videoId) return false;
  if (!isFreeModule(categorySlug)) return false;
  return (MODULE_VIDEOS[categorySlug] ?? []).some((v) => v.id === videoId);
}

/** Worksheet / supplemental PDFs that belong to a free module. */
export function isFreeModulePdf(pdfKey: string | undefined): boolean {
  if (!pdfKey) return false;
  for (const slug of FREE_MODULE_SLUGS) {
    for (const video of MODULE_VIDEOS[slug] ?? []) {
      const resources = SUPPLEMENTAL_RESOURCES[`${slug}:${video.id}`] ?? [];
      if (resources.some((r) => r.pdfKey === pdfKey)) return true;
    }
  }
  return false;
}
