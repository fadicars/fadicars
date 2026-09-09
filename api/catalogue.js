const cheerio = require("cheerio");

const CATEGORIES = [
  "avtomobili-dzhipove",
  "busove"
];

const REQUEST_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  "accept-language": "bg-BG,bg;q=0.9,en;q=0.8"
};

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

function categoryPageUrl(category, page = 1) {
  const pagePath = page > 1 ? `/p-${page}` : "";
  return `https://fadicars.mobile.bg/obiavi/${category}${pagePath}?sort=3`;
}

async function fetchCataloguePage(category, page = 1) {
  const response = await fetch(categoryPageUrl(category, page), { headers: REQUEST_HEADERS });
  if (!response.ok) throw new Error(`${category} catalogue page ${page} returned ${response.status}`);
  return decodeHtml(response);
}

function cataloguePageCount(html, category) {
  const $ = cheerio.load(html);
  let maximum = 1;
  $(`a[href*="/obiavi/${category}/p-"]`).each((_, anchor) => {
    const page = Number(($(anchor).attr("href") || "").match(/\/p-(\d+)/)?.[1] || 1);
    maximum = Math.max(maximum, page);
  });
  return maximum;
}

function normalizedFuel(value) {
  return String(value || "")
    .replace("Дизелов", "Дизел")
    .replace("Бензинов", "Бензин")
    .replace("Хибриден", "Хибрид");
}

function extractCars(html) {
  const $ = cheerio.load(html);
  const found = new Map();

  $('a[href*="/obiava-"]').each((_, anchor) => {
    const href = normalizeUrl($(anchor).attr("href"));
    if (!href || found.has(href)) return;

    const title = $(anchor).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    let container = $(anchor).closest(".item");
    if (!container.length) {
      container = $(anchor);
      for (let depth = 0; depth < 7; depth += 1) {
        container = container.parent();
        const text = container.text().replace(/\s+/g, " ").trim();
        if (/\d[\d\s]*\s*€/.test(text) && /\d[\d\s]*\s*км/.test(text)) break;
      }
    }

    const text = container.text().replace(/\s+/g, " ").trim();
    const priceText = text.match(/(?<![\d.])\d{1,3}(?:[ \u00a0]\d{3})*\s*€/)?.[0] || "";
    const yearText = text.match(/(?:януари|февруари|март|април|май|юни|юли|август|септември|октомври|ноември|декември)\s+\d{4}\s*г\./i)?.[0] || "";
    const mileageText = text.match(/\d[\d\s]*\s*км/)?.[0] || "";
    const fuel = text.match(/(Дизелов|Бензинов|Хибриден|Електрически|Газ\/Бензин)/i)?.[0] || "";
    const transmission = text.match(/(Полуавтоматична|Автоматична|Ръчна)/i)?.[0] || "";
    const category = text.match(/(Товаропътнически|Пътнически|Товарен|Микробус|Джип|Седан|Хечбек|Комби|Купе|Миниван|Пикап|Ван)/i)?.[0] || "";

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

let catalogueRefresh;

async function loadCatalogue() {
  if (!catalogueRefresh) {
    catalogueRefresh = (async () => {
    const firstPages = await Promise.all(CATEGORIES.map(async category => ({
      category,
      html: await fetchCataloguePage(category)
    })));
    const remainingPages = await Promise.all(firstPages.flatMap(({ category, html }) =>
      Array.from({ length: cataloguePageCount(html, category) - 1 }, (_, index) =>
        fetchCataloguePage(category, index + 2)
      )
    ));
    const pages = [...firstPages.map(page => page.html), ...remainingPages];

    const cars = pages.flatMap(extractCars);
    return [...new Map(cars.map(car => [car.id || car.listingUrl, car])).values()];
    })().finally(() => {
      catalogueRefresh = null;
    });
  }

  return catalogueRefresh;
}

module.exports = async function handler(req, res) {
  try {
    const currentCars = await loadCatalogue();

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=180, stale-while-revalidate=60");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=180, stale-while-revalidate=60");
    return res.status(200).json({ cars: currentCars });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Vercel-CDN-Cache-Control", "no-store");
    return res.status(502).json({
      error: "Could not load catalogue",
      detail: String(error.message || error)
    });
  }
};

module.exports.extractCars = extractCars;
module.exports.loadCatalogue = loadCatalogue;
