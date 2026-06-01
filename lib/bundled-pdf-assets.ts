/**
 * Small gym-routine PDFs ship in the app bundle so they work offline and
 * before they are uploaded to pdfBaseUrl (Netlify).
 */
const BUNDLED_PDF_MODULES: Record<string, number> = {
  "gzclp-training-guide": require("@/assets/documents/gzclp-training-guide.pdf"),
  "basic-beginner-routine": require("@/assets/documents/basic-beginner-routine.pdf"),
  "two-day-beginner-routine": require("@/assets/documents/two-day-beginner-routine.pdf"),
};

export function hasBundledPdf(pdfKey: string): boolean {
  return pdfKey in BUNDLED_PDF_MODULES;
}

export function getBundledPdfModule(pdfKey: string): number | undefined {
  return BUNDLED_PDF_MODULES[pdfKey];
}
