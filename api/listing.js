const cheerio = require("cheerio");

const ALLOWED = /^https:\/\/fadicars\.mobile\.bg\/obiava-[a-zA-Z0-9-]+$/;

async function decodeHtml(response) {
  return new TextDecoder("windows-1251").decode(await response.arrayBuffer());
}

function normalizeImage(url) {
  if (!url) return "";
  let value = String(url).replace(/\\\//g, "/").replace(/&amp;/g, "&");
  if (value.startsWith("//")) value = `https:${value}`;
  return value;
}

function cleanLines($) {
  return $("body").text()
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function nextValue(lines, label) {
  const index = lines.findIndex(line => line === label);
  if (index < 0) return "";
  for (let cursor = index + 1; cursor < Math.min(lines.length, index + 6); cursor += 1) {
    const value = lines[cursor];
    if (value && value !== label) return value;
  }
  return "";
}

function collectImages(html, $) {
  const images = new Set();

  const selectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'img[src*="photosorg"]',
    'img[data-src*="photosorg"]',
    'a[href*="photosorg"]'
  ];

  selectors.forEach(selector => {
    $(selector).each((_, element) => {
      const value =
        $(element).attr("content") ||
        $(element).attr("src") ||
        $(element).attr("data-src") ||
        $(element).attr("href");
      const normalized = normalizeImage(value);
      if (normalized) images.add(normalized);
    });
  });

  const normalizedHtml = html.replace(/\\\//g, "/");
  const patterns = [
    /(?:https?:)?\/\/(?:cdn2|mobistatic\d+)\.focus\.bg\/mobile\/photosorg\/[^"'<>\\\s]+\/big1\/[^"'<>\\\s]+\.(?:webp|jpe?g|png)/gi,
    /(?:https?:)?\/\/(?:cdn2|mobistatic\d+)\.focus\.bg\/mobile\/photosorg\/[^"'<>\\\s]+\.(?:webp|jpe?g|png)/gi
  ];

  patterns.forEach(pattern => {
    (normalizedHtml.match(pattern) || []).forEach(match => images.add(normalizeImage(match)));
  });

  const allImages = [...images].filter(Boolean);
  const largeImages = allImages.filter(image => /\/big1\//.test(image));
  return largeImages.length ? largeImages : allImages;
}

function extractDescription(lines) {
  const start = lines.findIndex(line => line === "Допълнителна информация");
  if (start < 0) return "";

  const endLabels = new Set([
    "Контакти с продавача",
    "Виж всички обяви",
    "Работно време"
  ]);

  const result = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (endLabels.has(lines[index])) break;
    if (!/^Обява:/.test(lines[index])) result.push(lines[index]);
  }
  return result.join("\n").trim();
}

function extractFeatures(lines) {
  const headings = new Set(["Безопасност", "Други", "Екстериор", "Защита", "Интериор", "Комфорт"]);
  const stopHeadings = new Set(["Допълнителна информация", "Контакти с продавача"]);
  const features = [];
  let active = false;

  for (const line of lines) {
    if (headings.has(line)) {
      active = true;
      continue;
    }
    if (active && stopHeadings.has(line)) break;
    if (!active) continue;
    if (
      line.length > 2 &&
      line.length < 100 &&
      !/^ФАДИ КАРС$/.test(line) &&
      !/^Виж всички/.test(line) &&
      !/^Обява:/.test(line)
    ) {
      features.push(line);
    }
  }

  return [...new Set(features)].slice(0, 100);
}

module.exports = async function handler(req, res) {
  const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!url || !ALLOWED.test(url)) {
    return res.status(400).json({ error: "Invalid listing URL" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "accept-language": "bg-BG,bg;q=0.9,en;q=0.8"
      }
    });

    if (!response.ok) throw new Error(`Listing returned ${response.status}`);

    const html = await decodeHtml(response);
    const $ = cheerio.load(html);
    const lines = cleanLines($);

    let title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text() ||
      "";

    title = title
      .replace(/\s*\|\s*Mobile\.bg.*$/i, "")
      .replace(/^\d[\d\s]*\s*€,\s*/, "")
      .replace(/\s*Обява:\s*\d+\s*$/i, "")
      .trim();

    const price = lines.find(line => /^\d[\d\s]*\s*€$/.test(line)) || "";
    const vat = lines.find(line => /ДДС/.test(line)) || "";

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");
    return res.status(200).json({
      title,
      price,
      vat,
      productionDate: nextValue(lines, "Дата на производство"),
      fuel: nextValue(lines, "Двигател"),
      power: nextValue(lines, "Мощност"),
      euro: nextValue(lines, "Евростандарт"),
      engine: nextValue(lines, "Кубатура [куб.см]") || nextValue(lines, "Кубатура"),
      transmission: nextValue(lines, "Скоростна кутия"),
      mileage: nextValue(lines, "Пробег [км]"),
      category: nextValue(lines, "Категория"),
      color: nextValue(lines, "Цвят"),
      description: extractDescription(lines),
      features: extractFeatures(lines),
      images: collectImages(html, $)
    });
  } catch (error) {
    return res.status(502).json({
      error: "Could not load listing",
      detail: String(error.message || error)
    });
  }
};
