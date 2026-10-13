#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cheerio = require("cheerio");

const cataloguePath = path.resolve(__dirname, "../assets/data/korea-cars.json");
const usage = 'Usage: node scripts/add-korea-car.js "https://www.nextauto.bg/cars-order/<id>" <FADI-EUR-price> [--preview]';
const clean = value => String(value ?? "").replace(/[\s\u200b\ufeff]+/g, " ").trim();
const known = value => /^(?:-|—|–|n\/?a)$/i.test(clean(value)) ? "" : clean(value);

function parseUrl(value) {
  let url;
  try { url = new URL(value); } catch (_) { throw new Error("Provide a valid public Next Auto cars-order URL."); }
  const match = url.pathname.match(/^\/cars-order\/(\d+)\/?$/);
  if (url.protocol !== "https:" || !["nextauto.bg", "www.nextauto.bg"].includes(url.hostname)
    || url.username || url.password || url.port || !match) {
    throw new Error("Only https://www.nextauto.bg/cars-order/<numeric-id> listing URLs are supported.");
  }
  return { listingId: match[1], sourceUrl: `https://www.nextauto.bg/cars-order/${match[1]}` };
}

function parsePrice(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("FADI price must be a positive EUR amount, e.g. 16999 or 16999.50 (no currency symbol or separators).");
  }
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(Math.round(price * 100))) {
    throw new Error("FADI price must be a positive, safely representable EUR amount.");
  }
  return price;
}

function formatPrice(price) {
  return `${new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(price).replace(/[\u00a0\u202f]/g, " ")} €`;
}

async function fetchListing(sourceUrl) {
  const identity = parseUrl(sourceUrl);
  let currentUrl = identity.sourceUrl;
  for (let redirects = 0; redirects <= 4; redirects++) {
    let response;
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(20000),
        headers: { "User-Agent": "FADI-local-Korea-importer/1.0", Accept: "text/html" }
      });
    } catch (error) { throw new Error(`Could not fetch Next Auto listing: ${error.message}`); }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Listing redirect has no destination.");
      const target = new URL(location, currentUrl);
      if (parseUrl(target.href).listingId !== identity.listingId) throw new Error("Listing redirected to a different vehicle.");
      currentUrl = target.href;
      continue;
    }
    if (!response.ok) throw new Error(`Next Auto request failed: HTTP ${response.status}.`);
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
      throw new Error("Next Auto did not return an HTML listing.");
    }
    let html;
    try { html = await response.text(); } catch (error) { throw new Error(`Could not read listing HTML: ${error.message}`); }
    if (!html.trim()) throw new Error("Next Auto returned an empty listing.");
    return html;
  }
  throw new Error("Too many listing redirects.");
}

function integer(value, label, unitPattern = /$^/) {
  const raw = known(value).replace(unitPattern, "").trim();
  if (!raw) return null;
  // Accept digits or thousands groups; never reinterpret a decimal as an integer.
  if (!/^(?:\d+|\d{1,3}(?:[ ,]\d{3})+)$/.test(raw)) throw new Error(`Cannot parse ${label}: ${value}`);
  const result = Number(raw.replace(/[ ,]/g, ""));
  if (!Number.isSafeInteger(result) || result < 0) throw new Error(`Invalid ${label}: ${value}`);
  return result;
}

function extractListing(html, identity) {
  const $ = cheerio.load(html);
  const root = $("#kt_app_content");
  const title = known(root.find("h1").first().text());
  const galleryElement = root.find("car-gallery");
  const specsHeading = root.find("h2").filter((_, element) => clean($(element).text()) === "Технически характеристики");
  if (!title || galleryElement.length !== 1 || specsHeading.length !== 1) {
    throw new Error("Vehicle HTML structure could not be parsed (title, gallery or specifications missing).");
  }
  const formId = root.find("landing-inquiry-form").attr(":car-id");
  if (formId && formId !== identity.listingId) throw new Error("Listing HTML belongs to a different source ID.");
  const specs = new Map();
  specsHeading.closest(".na-card").find("div").each((_, element) => {
    const row = $(element);
    const label = row.children("span");
    const value = row.children("strong");
    if (label.length === 1 && value.length === 1) specs.set(clean(label.text()), known(value.text()));
  });
  const make = specs.get("Марка") || "";
  const model = specs.get("Модел") || "";
  if (!make || !model) throw new Error("Vehicle make/model specifications could not be parsed.");
  const rawImages = galleryElement.attr(":images");
  let gallery;
  try { gallery = JSON.parse(rawImages); } catch (_) { throw new Error("Gallery JSON is missing or invalid."); }
  if (!Array.isArray(gallery)) throw new Error("Gallery JSON must be an array.");
  const images = gallery.map((entry, index) => {
    if (!entry || typeof entry.url !== "string" || !entry.url.trim()) throw new Error(`Gallery image ${index + 1} has no URL.`);
    let url;
    try { url = new URL(entry.url); } catch (_) { throw new Error(`Gallery image ${index + 1} has an invalid URL.`); }
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error(`Gallery image ${index + 1} uses an unsupported URL.`);
    return entry.url; // Preserve the exact gallery order and complete query strings.
  });
  const featuresHeading = root.find("h2").filter((_, element) => clean($(element).text()) === "Екстри и оборудване").first();
  const features = [...new Set(featuresHeading.next("div").find("span").map((_, element) => clean($(element).text())).get().filter(Boolean))];
  const descriptionHeading = root.find("h2").filter((_, element) => clean($(element).text()) === "Допълнителна информация").first();
  const year = integer(specs.get("Година"), "year");
  if (year !== null && (year < 1980 || year > 2099)) throw new Error(`Year is outside the supported range: ${year}`);
  const mileage = integer(specs.get("Пробег (км)"), "mileage", /\s*(?:км|km)$/i);
  const displacement = integer(specs.get("Кубатура (см³)"), "engine displacement", /\s*(?:см³|cm3|cc)$/i);
  return {
    title, make, model, year, mileage,
    trim: specs.get("Ниво на оборудване") || specs.get("Модификация") || "",
    fuel: specs.get("Гориво") || "",
    engine: displacement === null ? "" : `${displacement} см³`,
    power: specs.get("Мощност") || "",
    transmission: specs.get("Скоростна кутия") || "",
    drivetrain: specs.get("Задвижване") || "",
    color: specs.get("Цвят") || "",
    images, features,
    sourceIdentifier: specs.get("VIN") || "",
    sourceDescription: clean(descriptionHeading.next("p").text()),
    sourcePrice: clean(root.find("section").first().find(".text-right span").first().text())
  };
}

function buildRecord(extracted, identity, price) {
  const slug = extracted.make.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vehicle";
  const facts = [`${extracted.make} ${extracted.title}`];
  if (extracted.title.toLowerCase().startsWith(extracted.make.toLowerCase())) facts[0] = extracted.title;
  if (extracted.year !== null) facts.push(`${extracted.year} г.`);
  if (extracted.fuel) facts.push(extracted.fuel);
  if (extracted.transmission) facts.push(`${extracted.transmission} скоростна кутия`);
  if (extracted.mileage !== null) facts.push(`${new Intl.NumberFormat("bg-BG").format(extracted.mileage).replace(/[\u00a0\u202f]/g, " ")} км`);
  return {
    id: `${slug}-nextauto-${identity.listingId}`,
    title: extracted.title,
    make: extracted.make,
    model: extracted.model,
    trim: extracted.trim,
    year: extracted.year,
    mileage: extracted.mileage,
    fuel: extracted.fuel,
    engine: extracted.engine,
    power: extracted.power,
    transmission: extracted.transmission,
    drivetrain: extracted.drivetrain,
    color: extracted.color,
    price,
    priceText: formatPrice(price),
    status: "available", // Operator publishes an order offer; not a verified source availability claim.
    location: "Южна Корея",
    source: "nextauto",
    sourceUrl: identity.sourceUrl,
    image: extracted.images[0] || "",
    images: extracted.images,
    features: extracted.features,
    description: `${facts.join(", ")}. Автомобилът се предлага по поръчка от Южна Корея.`,
    notes: extracted.sourceIdentifier ? `Идентификатор от източника: ${extracted.sourceIdentifier}. VIN на шаси не е потвърден.` : ""
  };
}

function validateRecord(car) {
  const strings = ["id", "title", "make", "model", "trim", "fuel", "engine", "power", "transmission", "drivetrain", "color", "priceText", "status", "location", "source", "sourceUrl", "image", "description", "notes"];
  if (!car || typeof car !== "object" || Array.isArray(car)
    || strings.some(field => typeof car[field] !== "string") || !clean(car.id) || !clean(car.title)
    || !["available", "reserved", "sold", "removed"].includes(car.status)) throw new Error("Invalid vehicle record in Korea catalogue.");
  for (const field of ["year", "mileage", "price"]) {
    if (car[field] !== null && (!Number.isFinite(car[field]) || car[field] < 0)) throw new Error(`Invalid ${field} in Korea catalogue.`);
  }
  if (car.year !== null && (!Number.isInteger(car.year) || car.year < 1980 || car.year > 2099)) throw new Error("Invalid year in Korea catalogue.");
  for (const field of ["images", "features"]) {
    if (!Array.isArray(car[field]) || car[field].some(value => typeof value !== "string")) throw new Error(`Invalid ${field} array in Korea catalogue.`);
  }
}

function readCatalogue(file) {
  let raw;
  try { raw = fs.readFileSync(file, "utf8"); } catch (error) { throw new Error(`Could not read Korea catalogue: ${error.message}`); }
  let cars;
  try { cars = JSON.parse(raw); } catch (_) { throw new Error("korea-cars.json is invalid JSON; nothing was changed."); }
  if (!Array.isArray(cars)) throw new Error("korea-cars.json must contain an array; nothing was changed.");
  const ids = new Set();
  for (const car of cars) {
    validateRecord(car);
    if (ids.has(car.id)) throw new Error("Existing Korea catalogue contains duplicate IDs; nothing was changed.");
    ids.add(car.id);
  }
  return { cars, raw };
}

function findDuplicate(cars, record) {
  return cars.find(car => {
    if (car.id === record.id) return true;
    try { return car.sourceUrl && parseUrl(car.sourceUrl).sourceUrl === record.sourceUrl; } catch (_) { return false; }
  });
}

function preview(record, extracted, output = console.log) {
  output(`\n${record.title}\nYear: ${record.year ?? "unknown"}\nMileage: ${record.mileage ?? "unknown"} km\nFuel: ${record.fuel || "unknown"}\nTransmission: ${record.transmission || "unknown"}\nColor: ${record.color || "unknown"}\nFADI price: ${record.priceText}\nPhotos: ${record.images.length}\nEquipment entries: ${record.features.length}\nID: ${record.id}`);
  if (extracted.sourceIdentifier) output(`Source identifier (not a verified chassis VIN): ${extracted.sourceIdentifier}`);
  if (extracted.sourcePrice) output(`Next Auto displayed price (not used): ${extracted.sourcePrice}`);
}

function atomicWrite(file, cars, original) {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${crypto.randomUUID()}.tmp`);
  let handle;
  try {
    const content = `${JSON.stringify(cars, null, 2)}\n`;
    handle = fs.openSync(temporary, "wx", 0o600);
    fs.writeFileSync(handle, content, "utf8");
    fs.fsyncSync(handle);
    fs.closeSync(handle);
    handle = undefined;
    if (fs.readFileSync(file, "utf8") !== original) throw new Error("Korea catalogue changed during import; retry instead of overwriting it.");
    fs.renameSync(temporary, file);
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

async function main(args = process.argv.slice(2), options = {}) {
  if (args.length < 2 || args.length > 3 || (args[2] && args[2] !== "--preview")) throw new Error(usage);
  const identity = parseUrl(args[0]);
  const price = parsePrice(args[1]);
  const file = options.cataloguePath || cataloguePath;
  const output = options.output || console.log;
  const before = readCatalogue(file);
  if (findDuplicate(before.cars, { id: "", sourceUrl: identity.sourceUrl })) throw new Error("Vehicle already exists in the Korea catalogue (source URL); nothing was changed.");
  const extracted = extractListing(await (options.fetchListing || fetchListing)(identity.sourceUrl), identity);
  const record = buildRecord(extracted, identity, price);
  validateRecord(record);
  if (findDuplicate(before.cars, record)) throw new Error("Vehicle already exists in the Korea catalogue (ID/source URL); nothing was changed.");
  if (args[2] === "--preview") {
    preview(record, extracted, output);
    output("Preview only; catalogue not changed.");
    return record;
  }
  const lockFile = `${file}.lock`;
  let lock;
  try { lock = fs.openSync(lockFile, "wx", 0o600); } catch (error) {
    if (error.code === "EEXIST") throw new Error("Another import is in progress (catalogue lock exists); nothing was changed.");
    throw error;
  }
  try {
    const current = readCatalogue(file);
    if (findDuplicate(current.cars, record)) throw new Error("Vehicle already exists in the Korea catalogue (ID/source URL); nothing was changed.");
    preview(record, extracted, output);
    atomicWrite(file, [...current.cars, record], current.raw);
    output(`Added one vehicle to ${file}`);
  } finally {
    fs.closeSync(lock);
    fs.unlinkSync(lockFile);
  }
  return record;
}

if (require.main === module) {
  main().catch(error => { console.error(`Import failed: ${error.message}`); process.exitCode = 1; });
}
module.exports = { parseUrl, parsePrice, formatPrice, fetchListing, extractListing, buildRecord, validateRecord, readCatalogue, findDuplicate, atomicWrite, main };
