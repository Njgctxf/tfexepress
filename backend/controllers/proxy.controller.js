/* =========================
   IMAGE PROXY CONTROLLER v2
   Version indétectable par AliExpress.
========================= */
export async function proxyImage(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL manquante");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.aliexpress.com/",
        "Connection": "keep-alive"
      }
    });

    if (!response.ok) {
       // Si AliExpress bloque avec un code 403, on renvoie une image vide ou l'URL directe
       return res.status(response.status).send(`Erreur AliExpress: ${response.status}`);
    }

    const ab = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=604800"); 
    res.send(Buffer.from(ab));
  } catch (err) {
    res.status(500).send("Erreur Proxy");
  }
}
