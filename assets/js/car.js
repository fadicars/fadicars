(async () => {
  const core = window.FadiCore;
  const params = new URLSearchParams(location.search);
  const pathId = location.pathname.match(/^\/car\/(\d{10,})\/?$/)?.[1] || "";
  const listingParam = params.get("listing") || "";
  const stableUrl = /^https:\/\/fadicars\.mobile\.bg\/obiava-[a-zA-Z0-9-]+$/.test(listingParam)
    ? listingParam
    : "";
  const stableId = pathId || (/^\d{10,}$/.test(listingParam)
    ? listingParam
    : core.listingId(stableUrl));
  const legacyId = Number(params.get("id"));
  let catalogue = core.fallbackCars;
  try {
    const loadedCatalogue = await core.getCatalogue();
    if (Array.isArray(loadedCatalogue)) catalogue = loadedCatalogue;
  } catch (_) {}
  const matchedCar = stableId
    ? catalogue.find(car => car.listingUrl === stableUrl || core.listingId(car.listingUrl) === stableId || String(car.id) === stableId)
    : catalogue.find(car => Number(car.id) === legacyId);
  const matchedFallback = matchedCar || (stableId
    ? core.fallbackCars.find(car => car.listingUrl === stableUrl || core.listingId(car.listingUrl) === stableId)
    : core.fallbackCars.find(car => Number(car.id) === legacyId));
  const resolvedId = stableId || core.listingId(matchedFallback?.listingUrl);

  if (resolvedId && location.pathname !== `/car/${resolvedId}`) {
    location.replace(`/car/${resolvedId}`);
    return;
  }

  const fallback = matchedFallback || (stableId
    ? {
        id: stableId,
        displayName: "Автомобил",
        listingUrl: stableUrl || `https://fadicars.mobile.bg/obiava-${stableId}`,
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
  const shareButtons = document.querySelectorAll("[data-share-vehicle]");

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.cssText = "position:fixed;left:-9999px;opacity:0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Copy failed");
  }

  function setShareFeedback(button, copied = false) {
    const label = button.querySelector("[data-share-label]");
    if (label) label.textContent = copied ? "Линкът е копиран" : "Сподели";
  }

  async function shareVehicle(button) {
    if (button.dataset.shareBusy === "1") return;
    button.dataset.shareBusy = "1";
    button.disabled = true;

    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: button.dataset.shareTitle, url: button.dataset.shareUrl });
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }

      await copyText(button.dataset.shareUrl);
      setShareFeedback(button, true);
      window.setTimeout(() => setShareFeedback(button), 1800);
    } catch (_) {
      setShareFeedback(button);
    } finally {
      button.disabled = false;
      delete button.dataset.shareBusy;
    }
  }

  shareButtons.forEach(button => button.addEventListener("click", () => shareVehicle(button)));

  function renderVehicleSequence() {
    const navigation = get("#vehicleSequenceNav");
    const currentIndex = catalogue.findIndex(car => {
      const carId = core.listingId(car.listingUrl) || (/^\d{10,}$/.test(String(car.id || "")) ? String(car.id) : "");
      return carId === resolvedId;
    });

    if (currentIndex < 0) return;

    const previous = catalogue[currentIndex - 1];
    const next = catalogue[currentIndex + 1];
    const setLink = (direction, car) => {
      if (!car) return;
      const link = get(`#${direction}VehicleLink`);
      const title = car.title || car.displayName || `${car.brand || ""} ${car.model || ""}`.trim();
      link.href = core.detailUrl(car);
      link.setAttribute("aria-label", `${direction === "previous" ? "Предишен" : "Следващ"} автомобил: ${title}`);
      get(`#${direction}VehicleTitle`).textContent = title;
      link.hidden = false;
    };

    setLink("previous", previous);
    setLink("next", next);
    navigation.hidden = !previous && !next;
  }

  function specification(label, value) {
    if (!value) return "";
    return `<div class="specification-item"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function absoluteImageUrl(value) {
    let image = String(value || "").trim();
    if (!image) return "";
    if (image.startsWith("assets/")) image = `/${image}`;
    try {
      return new URL(image, location.origin).href;
    } catch (_) {
      return "";
    }
  }

  function vehicleMetaDescription(title, data = {}) {
    const facts = [];
    const year = data.productionDate || fallback.year;
    const fuel = data.fuel || fallback.fuel;
    const mileage = data.mileage || fallback.mileageText || (fallback.mileage ? `${core.formatNumber(fallback.mileage)} км` : "");
    const price = data.price || fallback.priceText || (fallback.price ? core.formatPrice(fallback.price) : "");

    if (year) facts.push(String(year).match(/г\.?$/) ? String(year) : `${year} г.`);
    if (fuel) facts.push(fuel);
    if (mileage) facts.push(mileage);
    if (price) facts.push(price);
    return `${title}${facts.length ? ` – ${facts.join(", ")}` : ""}. Автомобил от FADI CARS в София.`;
  }

  function setMetaContent(selector, value) {
    const element = get(selector);
    if (element && value) element.content = value;
  }

  function renderData(data = {}, live = false) {
    const title = data.title || fallback.title || fallback.displayName || "Автомобил";
    const price = data.price || core.formatPrice(fallback.price);
    const subtitle = [
      data.productionDate || `${fallback.month || ""} ${fallback.year || ""}`.trim(),
      data.fuel || fallback.fuel,
      data.category || fallback.body
    ].filter(Boolean).join(" • ");

    const pageTitle = `${title} | FADI CARS`;
    const description = vehicleMetaDescription(title, data);
    const image = absoluteImageUrl(data.images?.[0] || fallback.imageUrl || fallback.image);
    document.title = pageTitle;
    const canonicalUrl = core.canonicalVehicleUrl(resolvedId);
    get("#canonicalUrl").href = canonicalUrl;
    get("#openGraphUrl").content = canonicalUrl;
    setMetaContent("#metaDescription", description);
    setMetaContent("#openGraphTitle", pageTitle);
    setMetaContent("#openGraphDescription", description);
    setMetaContent("#openGraphImage", image);
    setMetaContent("#twitterTitle", pageTitle);
    setMetaContent("#twitterDescription", description);
    setMetaContent("#twitterImage", image);
    shareButtons.forEach(button => {
      button.dataset.shareUrl = canonicalUrl;
      button.dataset.shareTitle = title;
    });
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
  renderVehicleSequence();

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
