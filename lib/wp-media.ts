/** WordPress media URL on performancetreanor.wordpress.com */
export function wpUpload(relativePath: string): string {
  const normalized = relativePath.replace(/^\//, "");
  return `https://performancetreanor.wordpress.com/wp-content/uploads/${normalized}`;
}
