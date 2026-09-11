(async () => {
  const core = window.FadiCore;
  const params = new URLSearchParams(location.search);
  const listingParam = params.get("listing") || "";
  const stableUrl = /^https:\/\/fadicars\.mobile\.bg\/obiava-[a-zA-Z0-9-]+$/.test(listingParam)
    ? listingParam
    : "";
  const stableId = /^\d{10,}$/.test(listingParam)
    ? listingParam
    : core.listingId(stableUrl);
  const legacyId = Number(params.get("id"));
  const matchedFallback = stableId
    ? core.fallbackCars.find(car => car.listingUrl === stableUrl || core.listingId(car.listingUrl) === stableId)
    : core.fallbackCars.find(car => Number(car.id) === legacyId);
  const fallback = matchedFallback || (stableUrl
    ? {
        id: stableId,
        displayName: "Автомобил",
        listingUrl: stableUrl,
        image: core.placeholder
      }
    : null);

  const loader = document.querySelector("#detailLoader");
  const page = document.querySelector("#detailPage");

  if (!fallback) {
    loader.innerHTML = `<h2>Автомобилът не е намерен.</h2><a class="button button-red" href="/cars">Към каталога</a>`;
    return;
  }

  let gallery = [core.normalizedImage(fallback.image)];
  let currentImage = 0;
  let liveData = null;

  const get = selector => document.querySelector(selector);

  function specification(label, value) {
    if (!value) return "";
    return `<div class="specification-item"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function renderData(data = {}, live = false) {
    const title = data.title || fallback.displayName;
    const price = data.price || core.formatPrice(fallback.price);
    const subtitle = [
      data.productionDate || `${fallback.month || ""} ${fallback.year || ""}`.trim(),
      data.fuel || fallback.fuel,
      data.category || fallback.body
    ].filter(Boolean).join(" • ");

    document.title = `${title} | FADI CARS`;
    get("#breadcrumbTitle").textContent = title;
    get("#detailTitle").textContent = title;
    get("#detailSubtitle").textContent = subtitle;
    get("#detailPrice").textContent = price;
    get("#sidebarPrice").textContent = price;
    const mobilePrice = get("#mobileStickyPrice");
    if (mobilePrice) mobilePrice.textContent = price;
    get("#detailVat").textContent = data.vat || "";
    get("#sidebarVat").textContent = data.vat || "";

    get("#specificationGrid").innerHTML =
      specification("Дата на производство", data.productionDate || `${fallback.month || ""} ${fallback.year}`) +
      specification("Двигател", data.fuel || fallback.fuel) +
      specification("Мощност", data.power || `${fallback.power} к.с.`) +
      specification("Кубатура", data.engine || `${core.formatNumber(fallback.engine)} см³`) +
      specification("Скоростна кутия", data.transmission || fallback.transmission) +
      specification("Пробег", data.mileage || `${core.formatNumber(fallback.mileage)} км`) +
      specification("Категория", data.category || fallback.body) +
      specification("Цвят", data.color || fallback.color) +
      specification("Евростандарт", data.euro || fallback.euro);

    get("#detailDescription").textContent = data.description ||
      "За актуална информация относно състоянието, обслужването и условията за покупка се свържете директно с FADI CARS.";

    const features = Array.isArray(data.features) && data.features.length
      ? data.features
      : ["Свържете се с продавача за пълния списък с оборудване."];

    const equipmentGrid = get("#equipmentGrid");
    equipmentGrid.replaceChildren();
    features.forEach(feature => {
      const item = document.createElement("div");
      item.className = "equipment-item";
      item.textContent = feature;
      equipmentGrid.appendChild(item);
    });

    get("#dataStatus").textContent = live ? "АКТУАЛНИ ДАННИ" : "ОСНОВНИ ДАННИ";
    get("#dataStatus").classList.toggle("fallback", !live);
  }

  function renderGallery() {
    const thumbnails = get("#galleryThumbnails");
    thumbnails.innerHTML = gallery.map((image, index) =>
      `<button type="button" data-index="${index}" class="${index === currentImage ? "active" : ""}">
         <img loading="lazy" src="${image}" data-fallback="${core.placeholder}" alt="Снимка ${index + 1}">
       </button>`
    ).join("");

    core.activateImageFallbacks(thumbnails);

    thumbnails.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => setImage(Number(button.dataset.index)));
    });

    setImage(currentImage);
  }

  function setImage(index) {
    if (!gallery.length) return;
    currentImage = (index + gallery.length) % gallery.length;
    const mainImage = get("#mainGalleryImage");
    core.setImageSource(mainImage, gallery[currentImage]);
    mainImage.alt = `${fallback.displayName} – снимка ${currentImage + 1}`;
    get("#galleryCounter").textContent = `${currentImage + 1} / ${gallery.length}`;
    core.setImageSource(get("#lightboxImage"), gallery[currentImage]);

    document.querySelectorAll("#galleryThumbnails button").forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === currentImage);
    });
  }

  function openLightbox() {
    get("#lightbox").classList.add("open");
    get("#lightbox").setAttribute("aria-hidden", "false");
    core.setImageSource(get("#lightboxImage"), gallery[currentImage]);
  }

  function closeLightbox() {
    get("#lightbox").classList.remove("open");
    get("#lightbox").setAttribute("aria-hidden", "true");
  }

  const mainGalleryImage = get("#mainGalleryImage");
  const swipeThreshold = 48;
  let gestureStart = null;
  let suppressGalleryClick = false;

  mainGalleryImage.addEventListener("dragstart", event => event.preventDefault());
  mainGalleryImage.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gestureStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    if (event.pointerType === "mouse") mainGalleryImage.setPointerCapture(event.pointerId);
  });
  mainGalleryImage.addEventListener("pointerup", event => {
    if (!gestureStart || gestureStart.pointerId !== event.pointerId) return;

    const horizontal = event.clientX - gestureStart.x;
    const vertical = event.clientY - gestureStart.y;
    gestureStart = null;

    if (Math.abs(horizontal) < swipeThreshold || Math.abs(horizontal) <= Math.abs(vertical) * 1.25) return;

    suppressGalleryClick = true;
    setImage(currentImage + (horizontal < 0 ? 1 : -1));
    window.setTimeout(() => { suppressGalleryClick = false; }, 350);
  });
  mainGalleryImage.addEventListener("pointercancel", () => {
    gestureStart = null;
  });
  mainGalleryImage.addEventListener("click", event => {
    if (suppressGalleryClick) {
      event.preventDefault();
      suppressGalleryClick = false;
      return;
    }
    openLightbox();
  });

  get("#vehicleNavLink").addEventListener("click", event => {
    event.preventDefault();
    const galleryTop = get("#vehicleGallery").getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, galleryTop), behavior: "smooth" });
  });

  get("#galleryPrev").addEventListener("click", () => setImage(currentImage - 1));
  get("#galleryNext").addEventListener("click", () => setImage(currentImage + 1));
  get("#galleryExpand").addEventListener("click", openLightbox);
  get("#lightboxClose").addEventListener("click", closeLightbox);
  get("#lightboxPrev").addEventListener("click", () => setImage(currentImage - 1));
  get("#lightboxNext").addEventListener("click", () => setImage(currentImage + 1));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") setImage(currentImage - 1);
    if (event.key === "ArrowRight") setImage(currentImage + 1);
  });

  renderData({}, false);
  renderGallery();

  const related = core.fallbackCars
    .filter(car => car.id !== fallback.id && (car.brand === fallback.brand || car.body === fallback.body))
    .slice(0, 4);

  get("#relatedGrid").innerHTML = related.map(core.vehicleCard).join("");
  core.activateImageFallbacks(get("#relatedGrid"));

  loader.style.display = "none";
  page.hidden = false;

  if (location.protocol === "file:") {
    get("#galleryMessage").textContent =
      "Пълната галерия и актуалните данни се зареждат след публикуване във Vercel.";
    return;
  }

  try {
    const response = await fetch(`/api/listing?url=${encodeURIComponent(fallback.listingUrl)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Listing API failed");
    liveData = await response.json();

    if (Array.isArray(liveData.images) && liveData.images.length) {
      gallery = liveData.images;
      currentImage = 0;
      renderGallery();
    }

    renderData(liveData, true);
    get("#galleryMessage").textContent =
      gallery.length > 1
        ? `Заредени са ${gallery.length} снимки от актуалната обява.`
        : "Налична е една снимка за този автомобил.";
  } catch (error) {
    console.warn(error);
    get("#galleryMessage").textContent =
      "Актуалната галерия временно не може да се зареди. Потвърдете данните и наличността по телефона.";
  }
})();
