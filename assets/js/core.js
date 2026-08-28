(() => {
  const config = window.FADI_CONFIG;
  const fallbackCars = window.FADI_FALLBACK_CARS || [];

  const formatNumber = value => new Intl.NumberFormat("bg-BG").format(Number(value || 0));
  const formatPrice = value => `${formatNumber(value)} €`;
  const placeholder = "assets/images/car-placeholder.svg";

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
    if (location.protocol === "file:") return car.image || placeholder;
    return `/api/image?url=${encodeURIComponent(car.listingUrl)}`;
  }

  function vehicleCard(car) {
    const title = car.title || car.displayName || `${car.brand || ""} ${car.model || ""}`.trim();
    const price = car.priceText || formatPrice(car.price);
    const year = car.year || "";
    const mileage = car.mileageText || `${formatNumber(car.mileage)} км`;
    const fuel = car.fuel || "";
    const gearbox = car.transmission || "";
    const image = car.imageUrl || liveImageUrl(car);
    const detailUrl = `car.html?id=${car.id}`;

    return `
      <article class="vehicle-card">
        <a class="vehicle-image-link" href="${detailUrl}">
          <img loading="lazy" src="${image}" data-fallback="${car.image || placeholder}" alt="${title}">
          <span class="vehicle-badge">${car.body || car.category || "Автомобил"}</span>
        </a>
        <div class="vehicle-content">
          <span class="vehicle-year">${year}</span>
          <h3 class="vehicle-title"><a href="${detailUrl}">${title}</a></h3>
          <div class="vehicle-meta">
            <span>${mileage}</span>
            ${fuel ? `<span>${fuel}</span>` : ""}
            ${gearbox ? `<span>${gearbox}</span>` : ""}
          </div>
          <div class="vehicle-footer">
            <strong class="vehicle-price">${price}</strong>
            <a class="vehicle-open" href="${detailUrl}" aria-label="Отвори автомобила">→</a>
          </div>
        </div>
      </article>`;
  }

  function activateImageFallbacks(root = document) {
    root.querySelectorAll("img[data-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = "1";
        img.src = img.dataset.fallback || placeholder;
      }, { once: true });
    });
  }

  async function getCatalogue() {
    if (location.protocol === "file:") return fallbackCars;

    try {
      const response = await fetch("/api/catalogue");
      if (!response.ok) throw new Error("Catalogue API failed");
      const data = await response.json();
      if (!Array.isArray(data.cars) || !data.cars.length) throw new Error("No live cars");
      return data.cars.map((car, index) => ({
        ...fallbackCars[index],
        ...car,
        id: fallbackCars[index]?.id || car.id || index + 1,
        listingUrl: car.listingUrl || fallbackCars[index]?.listingUrl
      }));
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
    liveImageUrl,
    vehicleCard,
    activateImageFallbacks,
    getCatalogue
  };

  applyConfig();
  setupMenu();
})();