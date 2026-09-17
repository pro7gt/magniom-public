/**
 * @magniom/web - Open Redirect Defense & Navigation Sanitizer
 * Conforms to MAG-SEC-001 and OWASP ASVS §5.1 (Open Redirect Prevention).
 */

export function sanitizeRedirectUrl(url: string | null | undefined): string {
  if (!url) return '/';
  const trimmed = url.trim();
  // Permit only same-origin absolute paths starting with exactly one '/' and not followed by '/' or '\'
  if (!/^\/(?!\/|\\)/.test(trimmed)) return '/';
  // Reject control characters or CRLF injection
  if (/[\r\n\t]/.test(trimmed)) return '/';
  // Do not redirect back to /login
  if (trimmed.startsWith('/login')) return '/';
  // Do not redirect to static assets (images, icons, styles, scripts, fonts)
  if (/\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|json|map)$/i.test(trimmed)) return '/';
  return trimmed;
}
