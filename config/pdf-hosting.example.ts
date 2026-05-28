/**
 * Copy settings into app.json → expo.extra (or use env vars).
 *
 * Option A — Netlify / static host (recommended with Dropbox sync):
 *   1. Mirror assets/pdfs and assets/documents to your host under /pdfs/...
 *   2. Set pdfBaseUrl to that root, e.g. https://your-site.netlify.app/pdfs
 *
 * Option B — Dropbox folder with predictable paths:
 *   Use a tool to sync Dropbox → Netlify, or publish direct links.
 *   remotePath in data/pdf-catalog.ts mirrors assets/… file locations.
 *
 * app.json example:
 *   "extra": {
 *     "pdfBaseUrl": "https://your-site.netlify.app/pdfs"
 *   }
 *
 * Or in .env:
 *   EXPO_PUBLIC_PDF_BASE_URL=https://your-site.netlify.app/pdfs
 */

export const EXAMPLE_PDF_BASE_URL = "https://your-site.netlify.app/pdfs";
