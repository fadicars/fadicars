const fs = require("fs");
const path = require("path");
const { loadCatalogue } = require("./catalogue");

const SITE_ORIGIN = "https://www.fadicars.com";
const TEMPLATE_PATH = path.join(process.cwd(), "car.html");
const FALLBACK_PATH = require.resolve("../assets/js/cars.js");
const VALID_LISTING_ID = /^\d{10,20}$/;
const CATALOGUE_TTL_MS = 5 * 60 * 1000;
let templateCache;
let fallbackCache;
let catalogueCache;
let catalogueExpiresAt = 0;
let catalogueRefresh;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function listingId(value) {
  return String(value || "").match(/\/obiava-(\d+)(?:-|$)/)?.[1] || "";
}

function readTemplate() {
  if (!templateCache) templateCache = fs.readFileSync(TEMPLATE_PATH, "utf8");
  return templateCache;
}

function loadFallbackCars() {
  if (fallbackCache) return fallbackCache;
  const source = fs.readFileSync(FALLBACK_PATH, "utf8");
  const json = source.match(/^\s*window\.FADI_FALLBACK_CARS\s*=\s*([\s\S]*);\s*$/)?.[1];
  if (!json) throw new Error("Could not parse fallback vehicle data");
  fallbackCache = JSON.parse(json);
  return fallbackCache;
}

async function loadPageCatalogue() {
  if (catalogueCache && Date.now() < catalogueExpiresAt) return catalogueCache;
  if (!catalogueRefresh) {
    catalogueRefresh = loadCatalogue()
      .then(cars => {
        catalogueCache = cars;
        catalogueExpiresAt = Date.now() + CATALOGUE_TTL_MS;
        return cars;
      })
      .finally(() => {
        catalogueRefresh = null;
      });
  }
  return catalogueRefresh;
}

function absoluteImage(value) {
  const image = String(value || "").trim();
  if (/^https:\/\//i.test(image)) return image;
  if (image.startsWith("/")) return `${SITE_ORIGIN}${image}`;
  if (image.startsWith("assets/")) return `${SITE_ORIGIN}/${image}`;
  return `${SITE_ORIGIN}/assets/images/fadi-cars-logo-dark.png`;
}

function vehicleTitle(vehicle) {
  return String(
    vehicle.title ||
    vehicle.displayName ||
    `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() ||
    "Автомобил"
  ).replace(/\s+/g, " ").trim();
}

function metaDescription(vehicle, title = vehicleTitle(vehicle)) {
  const facts = [];
  const year = Number(vehicle.year) || "";
  const fuel = String(vehicle.fuel || "").trim();
  const mileage = String(vehicle.mileageText || "").trim();
  const price = String(vehicle.priceText || "").trim();

  if (year) facts.push(`${year} г.`);
  if (fuel) facts.push(fuel);
  if (mileage) facts.push(mileage);
  if (price) facts.push(price);

  return `${title}${facts.length ? ` – ${facts.join(", ")}` : ""}. Автомобил от FADI CARS в София.`;
}

function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error("Vehicle template marker is missing");
  return html.replace(pattern, replacement);
}

function renderVehiclePage(template, vehicle, id) {
  const title = vehicleTitle(vehicle);
  const pageTitle = `${title} | FADI CARS`;
  const description = metaDescription(vehicle, title);
  const canonical = `${SITE_ORIGIN}/car/${id}`;
  const image = absoluteImage(vehicle.imageUrl || vehicle.image);

  let html = template;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
  html = replaceTag(html, /<meta id="metaDescription"[^>]*>/i, `<meta id="metaDescription" name="description" content="${escapeHtml(description)}">`);
  html = replaceTag(html, /<link id="canonicalUrl"[^>]*>/i, `<link id="canonicalUrl" rel="canonical" href="${canonical}">`);
  html = replaceTag(html, /<meta id="openGraphUrl"[^>]*>/i, `<meta id="openGraphUrl" property="og:url" content="${canonical}">`);
  html = replaceTag(html, /<meta id="openGraphTitle"[^>]*>/i, `<meta id="openGraphTitle" property="og:title" content="${escapeHtml(pageTitle)}">`);
  html = replaceTag(html, /<meta id="openGraphDescription"[^>]*>/i, `<meta id="openGraphDescription" property="og:description" content="${escapeHtml(description)}">`);
  html = replaceTag(html, /<meta id="openGraphImage"[^>]*>/i, `<meta id="openGraphImage" property="og:image" content="${escapeHtml(image)}">`);
  html = replaceTag(html, /<meta id="twitterCard"[^>]*>/i, '<meta id="twitterCard" name="twitter:card" content="summary_large_image">');
  html = replaceTag(html, /<meta id="twitterTitle"[^>]*>/i, `<meta id="twitterTitle" name="twitter:title" content="${escapeHtml(pageTitle)}">`);
  html = replaceTag(html, /<meta id="twitterDescription"[^>]*>/i, `<meta id="twitterDescription" name="twitter:description" content="${escapeHtml(description)}">`);
  html = replaceTag(html, /<meta id="twitterImage"[^>]*>/i, `<meta id="twitterImage" name="twitter:image" content="${escapeHtml(image)}">`);
  html = replaceTag(html, /<h1 id="detailTitle">[\s\S]*?<\/h1>/i, `<h1 id="detailTitle">${escapeHtml(title)}</h1>`);
  return html;
}

function errorPage(status, heading, message) {
  return `<!doctype html><html lang="bg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${escapeHtml(heading)} | FADI CARS</title></head><body><main><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(message)}</p><a href="/cars">Към автомобилите</a></main></body></html>`;
}

async function resolveVehicle(id, catalogueLoader = loadCatalogue) {
  const fallbackCars = loadFallbackCars();
  const fallback = fallbackCars.find(car => listingId(car.listingUrl) === id || String(car.id) === id);

  try {
    const cars = await catalogueLoader();
    const live = (Array.isArray(cars) ? cars : []).find(car =>
      listingId(car.listingUrl) === id || String(car.id) === id
    );
    if (live) return { vehicle: { ...(fallback || {}), ...live }, source: "live" };
    if (fallback) return { vehicle: fallback, source: "fallback" };
    return { vehicle: null, source: "missing" };
  } catch (error) {
    if (fallback) return { vehicle: fallback, source: "fallback" };
    return { vehicle: null, source: "unavailable", error };
  }
}

async function serveVehiclePage(req, res, catalogueLoader = loadPageCatalogue) {
  const id = String(Array.isArray(req.query?.listingId) ? req.query.listingId[0] : req.query?.listingId || "");

  if (!VALID_LISTING_ID.test(id)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.status(404).send(errorPage(404, "Невалиден автомобил", "Адресът на автомобила е невалиден."));
  }

  const resolved = await resolveVehicle(id, catalogueLoader);
  if (resolved.source === "unavailable") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "60");
    return res.status(503).send(errorPage(503, "Временен проблем", "Информацията за автомобила временно не може да бъде заредена."));
  }

  if (!resolved.vehicle) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.status(404).send(errorPage(404, "Автомобилът не е намерен", "Този автомобил не е наличен в каталога."));
  }

  const html = renderVehiclePage(readTemplate(), resolved.vehicle, id);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=3600");
  res.setHeader("Vercel-CDN-Cache-Control", "max-age=300, stale-while-revalidate=3600");
  return res.status(200).send(html);
}

async function handler(req, res) {
  return serveVehiclePage(req, res);
}

module.exports = handler;
module.exports.absoluteImage = absoluteImage;
module.exports.escapeHtml = escapeHtml;
module.exports.listingId = listingId;
module.exports.loadFallbackCars = loadFallbackCars;
module.exports.loadPageCatalogue = loadPageCatalogue;
module.exports.metaDescription = metaDescription;
module.exports.renderVehiclePage = renderVehiclePage;
module.exports.resolveVehicle = resolveVehicle;
module.exports.serveVehiclePage = serveVehiclePage;
module.exports.vehicleTitle = vehicleTitle;
