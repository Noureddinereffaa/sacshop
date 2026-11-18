const POPUP_IMAGE_WIDTH = 640;
const POPUP_IMAGE_QUALITY = 75;

// Deterministic optimized URL for the popup image, used identically by
// the server preload, the SSR popup markup and the React popup — this
// guarantees a single download (no duplicate full-size fetch).
export function getPopupImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  return `/_next/image?url=${encodeURIComponent(raw)}&w=${POPUP_IMAGE_WIDTH}&q=${POPUP_IMAGE_QUALITY}`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch
  ));
}
