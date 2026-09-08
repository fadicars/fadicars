const cheerio = require("cheerio");
const { fetchListing } = require("./listing");

const PAGES = [
  "https://fadicars.mobile.bg/obiavi/avtomobili-dzhipove?sort=3",
  "https://fadicars.mobile.bg/obiavi/avtomobili-dzhipove/p-2?sort=3"
];

async function decodeHtml(response) {
  return new TextDecoder("windows-1251").decode(await response.arrayBuffer());
}

function normalizeUrl(value) {
  if (!value) return "";
  if (value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `https://fadicars.mobile.bg${value}`;
  return "";
}

function parseNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
}

function normalizedFuel(value) {
  return String(value || "")
    .replace("Дизелов", "Дизел")
    .replace("Бензинов", "Бензин")
    .replace("Хибриден", "Хибрид");
}

function mergeListingSummary(summary, listing) {
  const priceText = listing.price || summary.priceText;
  const mileageText = listing.mileage || summary.mileageText;
  const year = parseNumber(listing.productionDate) || summary.year;
  const primaryImage = Array.isArray(listing.images) ? listing.images[0] : "";

  return {
    ...summary,
    title: listing.title || summary.title,
    price: parseNumber(priceText) || summary.price,
    priceText,
    year,
    mileage: parseNumber(mileageText) || summary.mileage,
    mileageText,
    fuel: normalizedFuel(listing.fuel) || summary.fuel,
    transmission: listing.transmission || summary.transmission,
    category: listing.category || summary.category,
    body: listing.category || summary.body,
    imageUrl: primaryImage || summary.imageUrl
  };
}

async function enrichCars(cars, concurrency = 10) {
  const enriched = new Array(cars.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < cars.length) {
      const index = nextIndex++;
      const car = cars[index];
      try {
        enriched[index] = mergeListingSummary(car, await fetchListing(car.listingUrl));
      } catch (_) {
        enriched[index] = car;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, cars.length) }, worker));
  return enriched;
}

function extractCars(html) {
  const $ = cheerio.load(html);
  const found = new Map();

  $('a[href*="/obiava-"]').each((_, anchor) => {
    const href = normalizeUrl($(anchor).attr("href"));
    if (!href || found.has(href)) return;

    const title = $(anchor).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    let container = $(anchor);
    for (let depth = 0; depth < 7; depth += 1) {
      container = container.parent();
      const text = container.text().replace(/\s+/g, " ").trim();
      if (/\d[\d\s]*\s*€/.test(text) && /\d[\d\s]*\s*км/.test(text)) break;
    }

    const text = container.text().replace(/\s+/g, " ").trim();
    const priceText = text.match(/(?<![\d.])\d{1,3}(?:[ \u00a0]\d{3})*\s*€/)?.[0] || "";
    const yearText = text.match(/(?:януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември)\s+\d{4}\s*г\./i)?.[0] || "";
    const mileageText = text.match(/\d[\d\s]*\s*км/)?.[0] || "";
    const fuel = text.match(/(Дизелов|Бензинов|Хибриден|Електрически|Газ\/Бензин)/i)?.[0] || "";
    const transmission = text.match(/(Автоматична|Ръчна)/i)?.[0] || "";
    const category = text.match(/(Джип|Седан|Хечбек|Комби|Купе|Миниван|Пикап|Ван)/i)?.[0] || "";

    const imageElement = container.find('img[src*="photosorg"], img[data-src*="photosorg"]').first();
    let imageUrl = imageElement.attr("src") || imageElement.attr("data-src") || "";
    if (imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;

    const idMatch = href.match(/obiava-(\d+)/);
    const id = idMatch ? idMatch[1] : href;

    found.set(href, {
      id,
      title,
      listingUrl: href,
      price: parseNumber(priceText),
      priceText,
      year: parseNumber(yearText),
      mileage: parseNumber(mileageText),
      mileageText,
      fuel: fuel.replace("Дизелов", "Дизел").replace("Бензинов", "Бензин").replace("Хибриден", "Хибрид"),
      transmission,
      category,
      body: category,
      imageUrl
    });
  });

  return [...found.values()];
}

module.exports = async function handler(req, res) {
  try {
    const pages = await Promise.all(PAGES.map(async url => {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
          "accept-language": "bg-BG,bg;q=0.9,en;q=0.8"
        }
      });
      if (!response.ok) throw new Error(`Catalogue page returned ${response.status}`);
      return decodeHtml(response);
    }));

    const cars = pages.flatMap(extractCars);
    const unique = [...new Map(cars.map(car => [car.id || car.listingUrl, car])).values()];
    const currentCars = await enrichCars(unique);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("CDN-Cache-Control", "no-store");
    res.setHeader("Vercel-CDN-Cache-Control", "no-store");
    return res.status(200).json({ cars: currentCars });
  } catch (error) {
    return res.status(502).json({
      error: "Could not load catalogue",
      detail: String(error.message || error)
    });
  }
};

module.exports.mergeListingSummary = mergeListingSummary;
module.exports.enrichCars = enrichCars;
