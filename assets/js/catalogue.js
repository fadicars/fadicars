(async () => {
  const core = window.FadiCore;
  const i18n = window.FadiI18n;
  const cars = await core.getCatalogue();
  const pageSize = 16;
  let currentPage = 1;

  const e = {
    search: document.querySelector("#searchFilter"),
    brand: document.querySelector("#brandFilter"),
    fuel: document.querySelector("#fuelFilter"),
    gear: document.querySelector("#gearboxFilter"),
    body: document.querySelector("#bodyFilter"),
    price: document.querySelector("#priceFilter"),
    sort: document.querySelector("#sortFilter"),
    grid: document.querySelector("#catalogueGrid"),
    result: document.querySelector("#resultCount"),
    total: document.querySelector("#catalogueTotal"),
    pagination: document.querySelector("#pagination"),
    empty: document.querySelector("#emptyState"),
    drawer: document.querySelector("#filterDrawer"),
    backdrop: document.querySelector("#filterBackdrop"),
    activeCount: document.querySelector("#activeFilterCount"),
    brandShortcuts: document.querySelector("#brandShortcuts"),
    desktopSearch: document.querySelector("#desktopSearchMirror"),
    desktopBrand: document.querySelector("#desktopBrandMirror"),
    desktopFuel: document.querySelector("#desktopFuelMirror"),
    desktopGear: document.querySelector("#desktopGearMirror"),
    desktopPrice: document.querySelector("#desktopPriceMirror")
  };

  e.total.textContent = cars.length;

  function values(field) {
    return [...new Set(cars.map(car => car[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"bg"));
  }
  function fill(select, vals, translate = false) {
    vals.forEach(value => select.insertAdjacentHTML("beforeend", `<option value="${value}">${translate ? i18n.translateVehicleValue(value) : value}</option>`));
  }

  fill(e.brand, values("brand"));
  fill(e.fuel, values("fuel"), true);
  fill(e.gear, values("transmission"), true);
  fill(e.body, [...new Set(cars.map(c => c.body || c.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"bg")), true);

  // Mirror desktop options.
  e.desktopBrand.innerHTML = e.brand.innerHTML;
  e.desktopFuel.innerHTML = e.fuel.innerHTML;
  e.desktopGear.innerHTML = e.gear.innerHTML;

  function refreshVehicleOptionLabels() {
    [e.fuel, e.gear, e.body, e.desktopFuel, e.desktopGear].forEach(select => {
      [...select.options].forEach(option => {
        if (option.value) option.textContent = i18n.translateVehicleValue(option.value);
      });
    });
  }

  const params = new URLSearchParams(location.search);
  e.search.value = params.get("q") || "";
  e.brand.value = params.get("brand") || "";
  syncMirrors();

  const popularBrands = values("brand")
    .sort((a,b) => cars.filter(c=>c.brand===b).length - cars.filter(c=>c.brand===a).length)
    .slice(0, 12);

  e.brandShortcuts.innerHTML =
    `<button class="brand-shortcut active" data-brand="" type="button">${i18n.t("Всички")}</button>` +
    popularBrands.map(brand => `<button class="brand-shortcut" data-brand="${brand}" type="button">${brand}</button>`).join("");

  function openDrawer() {
    e.drawer.classList.add("open");
    e.backdrop.classList.add("open");
    e.drawer.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    e.drawer.classList.remove("open");
    e.backdrop.classList.remove("open");
    e.drawer.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
  }
  document.querySelector("#openFilters").addEventListener("click", openDrawer);
  document.querySelector("#closeFilters").addEventListener("click", closeDrawer);
  document.querySelector("#applyFilters").addEventListener("click", closeDrawer);
  e.backdrop.addEventListener("click", closeDrawer);

  function syncMirrors(source = "mobile") {
    if (source === "mobile") {
      e.desktopSearch.value = e.search.value;
      e.desktopBrand.value = e.brand.value;
      e.desktopFuel.value = e.fuel.value;
      e.desktopGear.value = e.gear.value;
      e.desktopPrice.value = e.price.value;
    } else {
      e.search.value = e.desktopSearch.value;
      e.brand.value = e.desktopBrand.value;
      e.fuel.value = e.desktopFuel.value;
      e.gear.value = e.desktopGear.value;
      e.price.value = e.desktopPrice.value;
    }
  }

  function countActiveFilters() {
    const count = [e.brand.value, e.fuel.value, e.gear.value, e.body.value, e.price.value].filter(Boolean).length;
    e.activeCount.textContent = count;
  }

  function filterCars() {
    const query = e.search.value.trim().toLowerCase();
    const maxPrice = Number(e.price.value || 0);
    const result = cars.filter(car => {
      const text = `${car.brand || ""} ${car.model || ""} ${car.title || ""}`.toLowerCase();
      return (!query || text.includes(query))
        && (!e.brand.value || car.brand === e.brand.value)
        && (!e.fuel.value || car.fuel === e.fuel.value)
        && (!e.gear.value || car.transmission === e.gear.value)
        && (!e.body.value || (car.body || car.category) === e.body.value)
        && (!maxPrice || Number(car.price || 0) <= maxPrice);
    });

    const sorters = {
      newest: (a,b) => (b.year || 0) - (a.year || 0) || (b.price || 0) - (a.price || 0),
      "price-asc": (a,b) => Number(a.price || 0) - Number(b.price || 0),
      "price-desc": (a,b) => Number(b.price || 0) - Number(a.price || 0),
      "mileage-asc": (a,b) => Number(a.mileage || 0) - Number(b.mileage || 0)
    };
    return result.sort(sorters[e.sort.value]);
  }

  function pagination(totalPages) {
    if (totalPages <= 1) {
      e.pagination.innerHTML = "";
      return;
    }
    e.pagination.innerHTML = Array.from({length: totalPages}, (_,i) =>
      `<button type="button" data-page="${i+1}" class="${i+1===currentPage?"active":""}">${i+1}</button>`
    ).join("");
    e.pagination.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        currentPage = Number(button.dataset.page);
        render();
        window.scrollTo({top: document.querySelector(".catalogue-section").offsetTop - 70, behavior:"smooth"});
      });
    });
  }

  function render() {
    const filtered = filterCars();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = 1;
    const pageCars = filtered.slice((currentPage-1)*pageSize, currentPage*pageSize);

    e.grid.innerHTML = pageCars.map(core.vehicleCard).join("");
    core.activateImageFallbacks(e.grid);
    e.result.textContent = filtered.length;
    e.empty.style.display = filtered.length ? "none" : "block";
    countActiveFilters();
    syncMirrors("mobile");
    e.brandShortcuts.querySelectorAll("[data-brand]").forEach(button =>
      button.classList.toggle("active", button.dataset.brand === e.brand.value)
    );
    pagination(totalPages);
  }

  function reset() {
    e.search.value = "";
    e.brand.value = "";
    e.fuel.value = "";
    e.gear.value = "";
    e.body.value = "";
    e.price.value = "";
    e.sort.value = "newest";
    currentPage = 1;
    render();
  }

  [e.search,e.brand,e.fuel,e.gear,e.body,e.price,e.sort].forEach(input =>
    input.addEventListener("input", () => { currentPage = 1; render(); })
  );

  [e.desktopSearch,e.desktopBrand,e.desktopFuel,e.desktopGear,e.desktopPrice].forEach(input =>
    input.addEventListener("input", () => {
      syncMirrors("desktop");
      currentPage = 1;
      render();
    })
  );

  document.querySelector("#clearFilters").addEventListener("click", reset);
  document.querySelector("#desktopClearFilters").addEventListener("click", reset);

  e.brandShortcuts.addEventListener("click", event => {
    const button = event.target.closest("[data-brand]");
    if (!button) return;
    e.brand.value = button.dataset.brand;
    currentPage = 1;
    render();
  });

  render();

  document.addEventListener("fadi:languagechange", () => {
    refreshVehicleOptionLabels();
    const allBrands = e.brandShortcuts.querySelector('[data-brand=""]');
    if (allBrands) allBrands.textContent = i18n.t("Всички");
    render();
  });
})();
