/**
 * Link validation for content we do not author ourselves (advertiser
 * destinations, links embedded in PDFs). Returns a normalised href or null;
 * script/data URLs and protocol-relative paths never become links.
 */

export interface SafeHrefOptions {
  /** Also accept mailto: and tel: (PDF links). Ads accept internal/HTTP(S) only. */
  allowContact?: boolean;
}

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function toSafeHref(raw: unknown, { allowContact = false }: SafeHrefOptions = {}): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048 || CONTROL_CHARS.test(value)) return null;

  // Internal path on this site: "/x", never "//host" or "/\host".
  if (value.startsWith("/")) {
    return value.startsWith("//") || value.startsWith("/\\") ? null : value;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const allowed = allowContact ? ["http:", "https:", "mailto:", "tel:"] : ["http:", "https:"];
  if (!allowed.includes(url.protocol)) return null;
  if ((url.protocol === "http:" || url.protocol === "https:") && !url.hostname) return null;
  return url.href;
}

/** True for absolute web URLs, which open in a new tab with safe rel attributes. */
export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}
