/**
 * Transforme une URL d'image AliExpress en passant par le proxy backend.
 * Cela contourne le blocage "anti-hotlinking" d'AliExpress.
 *
 * Pour les images stockées dans Supabase ou les URLs normales, elles sont renvoyées telles quelles.
 *
 * @param {string} url - L'URL de l'image d'origine
 * @returns {string} - L'URL finale (proxifiée si AliExpress, directe sinon)
 */

const ALIEXPRESS_DOMAINS = ["alicdn.com", "aliexpress.com", "ae01.alicdn.com", "ae-pic1.alicdn.com"];

const PROXY_BASE =
  import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace("/api", "") + "/api/proxy/image"
    : "http://localhost:5000/api/proxy/image";

export function getProxiedImageUrl(url) {
  if (!url || typeof url !== "string") return "/placeholder.png";

  // Si l'URL est déjà une URL interne (Supabase, chemin local), on ne proxy pas
  if (!url.startsWith("http")) return url;

  try {
    const parsed = new URL(url);
    const isAliExpress = ALIEXPRESS_DOMAINS.some((domain) =>
      parsed.hostname.endsWith(domain)
    );

    if (isAliExpress) {
      return `${PROXY_BASE}?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }

  return url;
}
