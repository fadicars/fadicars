(() => {
  const config = window.FADI_CONFIG;
  const fallbackCars = window.FADI_FALLBACK_CARS || [];

  const formatNumber = value => new Intl.NumberFormat("bg-BG").format(Number(value || 0));
  const formatPrice = value => `${formatNumber(value)} €`;
  const placeholder = "/assets/images/car-placeholder.svg";
  const knownBrands = [...new Set(fallbackCars.map(car => car.brand).filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  function inferVehicleName(title, backup = {}) {
    if (backup.brand && backup.model) return { brand: backup.brand, model: backup.model };
    const matchedBrand = knownBrands.find(brand => title.toLowerCase().startsWith(brand.toLowerCase()))
      || (title.toLowerCase().startsWith("vw ") ? "Volkswagen" : "");
    const titleBrand = matchedBrand === "Volkswagen" && title.toLowerCase().startsWith("vw ")
      ? "VW"
      : matchedBrand;
    return {
      brand: backup.brand || matchedBrand,
      model: backup.model || (titleBrand ? title.slice(titleBrand.length).trim() : title)
    };
  }

  function listingId(value) {
    return String(value || "").match(/\/obiava-(\d+)(?:-|$)/)?.[1] || "";
  }

  function normalizedImage(value) {
    if (!value || value === "assets/car-placeholder.svg") return placeholder;
    return value;
  }

  function detailUrl(car) {
    const stableId = listingId(car.listingUrl) || (/^\d{10,}$/.test(String(car.id || "")) ? String(car.id) : "");
    return stableId ? `/car/${stableId}` : `/car?id=${encodeURIComponent(car.id || "")}`;
  }

  function canonicalVehicleUrl(stableId) {
    return `https://www.fadicars.com/car/${encodeURIComponent(stableId)}`;
  }

  function applyConfig() {
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
    document.querySelectorAll("[data-phone-text]").forEach(el => el.textContent = config.phoneDisplay);
    document.querySelectorAll("[data-phone-link]").forEach(el => el.href = `tel:${config.phoneHref}`);
    document.querySelectorAll("[data-email-text]").forEach(el => el.textContent = config.emailDisplay);
    document.querySelectorAll("[data-email-link]").forEach(el => el.href = `mailto:${config.emailHref}`);
    document.querySelectorAll("[data-map-link]").forEach(el => el.href = config.mapUrl);
    document.querySelectorAll("[data-address-text]").forEach(el => {
      el.textContent = config.address;
    });
  }

  function setupMenu() {
    const button = document.querySelector(".mobile-menu-button");
    const nav = document.querySelector(".site-nav");
    button?.addEventListener("click", () => {
      const open = nav?.classList.toggle("open");
      button.setAttribute("aria-expanded", String(Boolean(open)));
    });
  }

  function liveImageUrl(car) {
    if (location.protocol === "file:" || !car.listingUrl) return normalizedImage(car.image);
    return `/api/image?url=${encodeURIComponent(car.listingUrl)}`;
  }

  function vehicleCard(car, index = 0) {
    const sourceTitle = car.title || car.displayName || `${car.brand || ""} ${car.model || ""}`.trim();
    const title = window.FadiI18n.translateVehicleTitle(sourceTitle);
    const price = car.priceText || formatPrice(car.price);
    const year = car.year || "";
    const mileage = window.FadiI18n.translateVehicleValue(car.mileageText || `${formatNumber(car.mileage)} км`);
    const fuel = window.FadiI18n.translateVehicleValue(car.fuel || "");
    const gearbox = window.FadiI18n.translateVehicleValue(car.transmission || "");
    const body = window.FadiI18n.translateVehicleValue(car.body || car.category || "Автомобил");
    const image = car.imageUrl ? normalizedImage(car.imageUrl) : liveImageUrl(car);
    const url = detailUrl(car);

    return `
      <article class="vehicle-card" data-i18n-ignore>
        <a class="vehicle-image-link" href="${url}">
          <img loading="${index < 4 ? "eager" : "lazy"}" decoding="async"${index < 4 ? ' fetchpriority="high"' : ""} src="${image}" data-fallback="${placeholder}" alt="${title}">
          <span class="vehicle-badge">${body}</span>
        </a>
        <div class="vehicle-content">
          <span class="vehicle-year">${year}</span>
          <h3 class="vehicle-title"><a href="${url}">${title}</a></h3>
          <div class="vehicle-meta">
            <span>${mileage}</span>
            ${fuel ? `<span>${fuel}</span>` : ""}
            ${gearbox ? `<span>${gearbox}</span>` : ""}
          </div>
          <div class="vehicle-footer">
            <strong class="vehicle-price">${price}</strong>
            <a class="vehicle-open" href="${url}" aria-label="${window.FadiI18n.t("Отвори автомобила")}">→</a>
          </div>
        </div>
      </article>`;
  }

  function activateImageFallbacks(root = document) {
    root.querySelectorAll("img[data-fallback]").forEach(img => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = "1";
      img.addEventListener("error", () => {
        if (img.dataset.fallbackActive) return;
        img.dataset.fallbackActive = "1";
        img.src = normalizedImage(img.dataset.fallback);
      });
    });
  }

  function setImageSource(img, src, fallback = placeholder) {
    img.dataset.fallback = normalizedImage(fallback);
    delete img.dataset.fallbackActive;
    img.src = normalizedImage(src);
    activateImageFallbacks(img.parentElement || document);
  }

  let cataloguePromise;

  async function loadCatalogue() {
    if (location.protocol === "file:") return fallbackCars;

    try {
      const response = await fetch("/api/catalogue");
      if (!response.ok) throw new Error("Catalogue API failed");
      const data = await response.json();
      if (!Array.isArray(data.cars) || !data.cars.length) throw new Error("No live cars");
      const fallbackByUrl = new Map(fallbackCars.map(car => [car.listingUrl, car]));
      const fallbackById = new Map(fallbackCars.map(car => [listingId(car.listingUrl), car]));
      return data.cars.map(car => {
        const stableId = listingId(car.listingUrl) || String(car.id || "");
        const backup = fallbackByUrl.get(car.listingUrl) || fallbackById.get(stableId) || {};
        const name = inferVehicleName(car.title || backup.displayName || "", backup);
        return {
          ...backup,
          ...car,
          brand: car.brand || name.brand,
          model: car.model || name.model,
          id: stableId || String(backup.id || ""),
          listingUrl: car.listingUrl || backup.listingUrl
        };
      });
    } catch (error) {
      console.warn("Using fallback catalogue:", error);
      return fallbackCars;
    }
  }

  function getCatalogue() {
    if (!cataloguePromise) cataloguePromise = loadCatalogue();
    return cataloguePromise;
  }

  window.FadiCore = {
    config,
    fallbackCars,
    formatNumber,
    formatPrice,
    placeholder,
    listingId,
    canonicalVehicleUrl,
    normalizedImage,
    detailUrl,
    liveImageUrl,
    vehicleCard,
    activateImageFallbacks,
    setImageSource,
    getCatalogue
  };

  applyConfig();
  setupMenu();
  window.FadiI18n.init();
})();
