(() => {
  const i18n = window.FadiI18n;
  let pending;
  const t = value => i18n.t(value);
  const text = value => typeof value === "string" ? value.trim() : "";
  const active = car => car && ["available", "reserved"].includes(car.status);

  // Today the shared source is manual JSON. An importer can populate this file,
  // or load() can use an API later, without changing the page rendering logic.
  function load() {
    if (!pending) pending = fetch("/assets/data/korea-cars.json", { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error("Korea data unavailable");
        return response.json();
      })
      .then(records => {
        if (!Array.isArray(records)) throw new Error("Invalid Korea data");
        const ids = new Set();
        return records.filter(car => {
          if (!car || typeof car !== "object" || !text(car.id) || !text(car.title) || ids.has(car.id)) return false;
          ids.add(car.id);
          return true;
        });
      });
    return pending;
  }

  function node(tag, className = "", value) {
    const element = document.createElement(tag);
    element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }
  function link(label, href, className = "button button-outline") {
    const element = node("a", className, t(label));
    element.href = href;
    return element;
  }
  function imageUrl(value) {
    if (!text(value)) return "";
    try {
      const url = new URL(value, location.origin);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  function image(value, title, eager = false) {
    const frame = node("div", "korea-image-frame");
    const placeholder = node("div", "korea-image-placeholder", t("Снимка предстои"));
    frame.append(placeholder);
    const url = imageUrl(value);
    if (url) {
      const img = node("img");
      img.alt = title;
      img.loading = eager ? "eager" : "lazy";
      img.decoding = "async";
      // Keep lazy images in layout so the browser can request them before load.
      img.classList.add("korea-image-loading");
      img.addEventListener("load", () => { img.classList.remove("korea-image-loading"); placeholder.hidden = true; });
      img.addEventListener("error", () => { img.remove(); placeholder.hidden = false; });
      img.src = url;
      frame.append(img);
    }
    return frame;
  }
  const number = value => Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat(i18n.getLanguage() === "en" ? "en-GB" : "bg-BG").format(value) : "—";
  const year = value => Number.isInteger(value) && value >= 1980 && value <= 2099 ? String(value) : "—";
  const localized = (car, field) => i18n.getLanguage() === "en"
    ? text(car[`${field}En`]) || i18n.translateVehicleValue(t(text(car[field])))
    : text(car[field]);
  const title = car => i18n.getLanguage() === "en"
    ? text(car.titleEn) || i18n.translateVehicleTitle(car.title) : car.title;
  const price = car => text(car.priceText) ? i18n.translateVehicleValue(car.priceText) : t("Цена по запитване");
  const mileage = car => Number.isFinite(car.mileage) && car.mileage >= 0
    ? `${number(car.mileage)} ${t("км")}` : "—";
  const detailUrl = car => `/korea-car?id=${encodeURIComponent(car.id)}`;
  const enquiryUrl = car => `/korea?car=${encodeURIComponent(car.id)}#korea-enquiry`;
  function state(root, heading, message = "", catalogueLink = false) {
    root.replaceChildren();
    const panel = node("div", "korea-catalogue-state");
    panel.append(node("h2", "", t(heading)));
    if (message) panel.append(node("p", "", t(message)));
    const actions = node("div", "korea-state-actions");
    if (catalogueLink) actions.append(link("Виж автомобилите от Корея", "/korea-cars"));
    actions.append(link(catalogueLink ? "Поръчай автомобил" : "Изпрати запитване", "/korea#korea-enquiry", "button button-red"));
    panel.append(actions);
    root.append(panel);
  }
  window.FadiKorea = { load, active, text, t, node, link, image, imageUrl, number, year, localized, title, price, mileage, detailUrl, enquiryUrl, state };
})();
