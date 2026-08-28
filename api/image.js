const ALLOWED = /^https:\/\/fadicars\.mobile\.bg\/obiava-[a-zA-Z0-9-]+$/;

function normalizeImage(url) {
  let value = String(url || "").replace(/\\\//g, "/").replace(/&amp;/g, "&");
  if (value.startsWith("//")) value = `https:${value}`;
  return value;
}

module.exports = async function handler(req, res) {
  const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!url || !ALLOWED.test(url)) return res.status(400).send("Invalid listing URL");

  try {
    const listingResponse = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "accept-language": "bg-BG,bg;q=0.9,en;q=0.8"
      }
    });
    if (!listingResponse.ok) throw new Error(`Listing returned ${listingResponse.status}`);

    const html = (await listingResponse.text()).replace(/\\\//g, "/");
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/(?:https?:)?\/\/(?:cdn2|mobistatic\d+)\.focus\.bg\/mobile\/photosorg\/[^"'<>\\\s]+\/big1\/[^"'<>\\\s]+\.(?:webp|jpe?g|png)/i)?.[0];

    if (!match) throw new Error("No listing image found");
    const imageUrl = normalizeImage(match);

    const imageResponse = await fetch(imageUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "referer": url
      }
    });
    if (!imageResponse.ok) throw new Error(`Image returned ${imageResponse.status}`);

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    res.setHeader("Content-Type", imageResponse.headers.get("content-type") || "image/webp");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(404).send("Image unavailable");
  }
};