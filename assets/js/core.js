(() => {
  const config = window.FADI_CONFIG;
  const fallbackCars = window.FADI_FALLBACK_CARS || [];

  const formatNumber = value => new Intl.NumberFormat("bg-BG").format(Number(value || 0));
  const formatPrice = value => `${formatNumber(value)} €`;
  const placeholder = "assets/images/car-placeholder.svg";
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
    const stableListing = /^https:\/\/fadicars\.mobile\.bg\/obiava-[a-zA-Z0-9-]+$/.test(car.listingUrl || "")
      ? car.listingUrl
      : "";
    const stableId = /^\d{10,}$/.test(String(car.id || "")) ? String(car.id) : "";
    return stableListing
      ? `car.html?listing=${encodeURIComponent(stableListing)}`
      : stableId
        ? `car.html?listing=${encodeURIComponent(stableId)}`
      : `car.html?id=${encodeURIComponent(car.id || "")}`;
  }

  function applyConfig() {
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
    document.querySelectorAll("[data-phone-text]").forEach(el => el.textContent = config.phoneDisplay);
    document.querySelectorAll("[data-phone-link]").forEach(el => el.href = `tel:${config.phoneHref}`);
    document.querySelectorAll("[data-map-link]").forEach(el => el.href = config.mapUrl);
    document.querySelectorAll("[data-address-text]").forEach(el => {
      el.textContent = `${config.city}, ${config.district}, ${config.address}`;
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

  function vehicleCard(car) {
    const title = car.title || car.displayName || `${car.brand || ""} ${car.model || ""}`.trim();
    const price = car.priceText || formatPrice(car.price);
    const year = car.year || "";
    const mileage = car.mileageText || `${formatNumber(car.mileage)} км`;
    const fuel = car.fuel || "";
    const gearbox = car.transmission || "";
    const image = car.imageUrl ? normalizedImage(car.imageUrl) : liveImageUrl(car);
    const url = detailUrl(car);

    return `
      <article class="vehicle-card">
        <a class="vehicle-image-link" href="${url}">
          <img loading="lazy" src="${image}" data-fallback="${placeholder}" alt="${title}">
          <span class="vehicle-badge">${car.body || car.category || "Автомобил"}</span>
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
            <a class="vehicle-open" href="${url}" aria-label="Отвори автомобила">→</a>
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

  async function getCatalogue() {
    if (location.protocol === "file:") return fallbackCars;

    try {
      const response = await fetch("/api/catalogue");
      if (!response.ok) throw new Error("Catalogue API failed");
      const data = await response.json();
      if (!Array.isArray(data.cars) || !data.cars.length) throw new Error("No live cars");
      const fallbackByUrl = new Map(fallbackCars.map(car => [car.listingUrl, car]));
      return data.cars.map(car => {
        const backup = fallbackByUrl.get(car.listingUrl) || {};
        const name = inferVehicleName(car.title || backup.displayName || "", backup);
        return {
          ...backup,
          ...car,
          brand: car.brand || name.brand,
          model: car.model || name.model,
          id: listingId(car.listingUrl) || String(car.id || backup.id || ""),
          listingUrl: car.listingUrl || backup.listingUrl
        };
      });
    } catch (error) {
      console.warn("Using fallback catalogue:", error);
      return fallbackCars;
    }
  }

  window.FadiCore = {
    config,
    fallbackCars,
    formatNumber,
    formatPrice,
    placeholder,
    listingId,
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
})();
