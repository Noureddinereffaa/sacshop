export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://serviceserigraphie.com").replace(/\/+$/, "");

export function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return SITE_URL;
  if (typeof window !== "undefined" && !window.location.origin.includes("localhost")) {
    return window.location.origin;
  }
  return SITE_URL;
}
