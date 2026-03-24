/**
 * Retourne l'URL de l'image directe mais assure l'affichage sans referrer.
 */
export function getProxiedImageUrl(url) {
  if (!url || typeof url !== "string") return "/placeholder.png";
  
  // On revient sur l'URL directe AliExpress !
  // Notre balise <meta name="referrer" content="no-referrer"> dans index.html
  // s'occupera de débloquer l'image.
  return url;
}
