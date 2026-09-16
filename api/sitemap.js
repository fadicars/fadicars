const { loadCatalogue } = require("./catalogue");

const SITE_ORIGIN = "https://www.fadicars.com";
const STATIC_PATHS = ["/", "/cars", "/leasing", "/contact"];

function listingId(value) {
  return String(value || "").match(/\/obiava-(\d+)(?:-|$)/)?.[1] || "";
}

function buildSitemap(cars) {
  const vehiclePaths = [...new Set(
    (Array.isArray(cars) ? cars : [])
      .map(car => listingId(car.listingUrl))
      .filter(Boolean)
      .map(id => `/car/${id}`)
  )];
  const urls = [...STATIC_PATHS, ...vehiclePaths];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(path => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`),
    '</urlset>',
    ''
  ].join("\n");
}

module.exports = async function handler(req, res) {
  try {
    const cars = await loadCatalogue();
    const sitemap = buildSitemap(cars);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=300, stale-while-revalidate=60");
    return res.status(200).send(sitemap);
  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Vercel-CDN-Cache-Control", "no-store");
    return res.status(502).send("Could not generate sitemap");
  }
};

module.exports.buildSitemap = buildSitemap;
module.exports.listingId = listingId;
