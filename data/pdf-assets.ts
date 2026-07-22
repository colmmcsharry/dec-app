/**
 * Worksheet PDFs keyed by module slug.
 * Built from video supplemental resources (`pdfKey` only — not YouTube/TED links).
 * Files are hosted remotely — see data/pdf-catalog.ts and extra.pdfBaseUrl.
 */

import { MODULE_ORDER } from "@/constants/module-themes";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { SUPPLEMENTAL_RESOURCES } from "@/data/supplemental-resources";

export interface PdfEntry {
  id: string;
  title: string;
}

export type ModulePdfs = Record<string, PdfEntry[]>;

/** Collect unique PDF guides for a module, in video / lesson order. */
export function getModulePdfGuides(slug: string): PdfEntry[] {
  const videos = MODULE_VIDEOS[slug] || [];
  const seen = new Set<string>();
  const pdfs: PdfEntry[] = [];

  for (const video of videos) {
    const resources = SUPPLEMENTAL_RESOURCES[`${slug}:${video.id}`] ?? [];
    for (const resource of resources) {
      if (!resource.pdfKey || seen.has(resource.pdfKey)) continue;
      seen.add(resource.pdfKey);
      pdfs.push({ id: resource.pdfKey, title: resource.title });
    }
  }

  return pdfs;
}

function buildModulePdfs(): ModulePdfs {
  const result: ModulePdfs = {};
  for (const slug of MODULE_ORDER) {
    result[slug] = getModulePdfGuides(slug);
  }
  return result;
}

export const MODULE_PDFS: ModulePdfs = buildModulePdfs();
