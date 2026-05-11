/**
 * Canonical navigation target for the in-app digital workbook.
 *
 * `services/module-workbooks` loads and saves JSON keyed only by this `slug`
 * (`module_workbooks.json`). Any screen that opens the workbook must push
 * this exact route + params so all entry points share the same document.
 */
export function hrefModuleDigitalWorkbook(slug: string) {
  return {
    pathname: "/module-workbook/[slug]" as const,
    params: { slug },
  };
}
