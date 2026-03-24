/* =========================
   IMAGE PROXY CONTROLLER
   Contourne le blocage d'AliExpress.
========================= */
export async function proxyImage(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("URL manquante");
  }

  const allowedDomains = [
    "alicdn.com",
    "aliexpress.com",
    "img.alicdn.com"
  ];

  try {
    const parsedUrl = new URL(url);
    const isAllowed = allowedDomains.some(d => parsedUrl.hostname.endsWith(d));
    if (!isAllowed) return res.status(403).send("Non autorisé");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.aliexpress.com/"
      }
    });

    if (!response.ok) return res.status(404).send("Image absente");

    const ab = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.send(Buffer.from(ab));
  } catch (err) {
    res.status(500).send("Erreur proxy");
  }
}
