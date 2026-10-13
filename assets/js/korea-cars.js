(() => {
  const K = window.FadiKorea;
  const root = document.getElementById("koreaCatalogue");
  const desktop = document.getElementById("koreaDesktopFilters");
  const mobile = document.getElementById("koreaMobileFilters");
  if (!root || !desktop || !mobile) return;
  let cars = [];
  let loaded = false;
  let failed = false;
  const controls = [...document.querySelectorAll("[data-korea-filter]")];
  const state = { search: "", make: "", fuel: "", transmission: "", year: "", price: "" };
  const sort = document.getElementById("koreaSort");
  const drawer = document.getElementById("koreaFilterDrawer");
  const backdrop = document.getElementById("koreaFilterBackdrop");
  const opener = document.getElementById("koreaOpenFilters");
  const closer = document.getElementById("koreaCloseFilters");
  const breakpoint = window.matchMedia("(min-width:900px)");
  const outside = [...document.querySelectorAll(".site-header,main,.site-footer,.mobile-bottom-nav")];
  let previousFocus;
  let previousOverflow = "";
  const previousInert = new Map();
  const defaults = { make: "Всички марки", fuel: "Всички горива", transmission: "Всички", year: "Без ограничение", price: "Без ограничение" };

  function syncControls() {
    controls.forEach(control => { control.value = state[control.dataset.koreaFilter]; });
    document.getElementById("koreaActiveFilterCount").textContent = [state.make, state.fuel, state.transmission, state.year, state.price].filter(Boolean).length;
  }
  function fillOptions() {
    const values = {};
    ["make", "fuel", "transmission"].forEach(field => {
      values[field] = [...new Set(cars.map(car => K.text(car[field])).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    });
    values.year = [...new Set(cars.map(car => car.year).filter(year => Number.isInteger(year) && year >= 1980 && year <= new Date().getFullYear() + 1))].sort((a, b) => b - a).map(String);
    values.price = [10000, 15000, 20000, 25000, 50000, 100000].map(String);
    controls.filter(control => control.tagName === "SELECT").forEach(control => {
      const field = control.dataset.koreaFilter;
      control.setAttribute("data-i18n-ignore", "");
      const first = K.node("option", "", K.t(defaults[field]));
      first.value = "";
      control.replaceChildren(first);
      values[field].forEach(value => {
        const label = field === "price" ? `${new Intl.NumberFormat("bg-BG").format(Number(value)).replace(/[\u00a0\u202f]/g, " ")} €`
          : ["fuel", "transmission"].includes(field) ? window.FadiI18n.translateVehicleValue(value) : value;
        const option = K.node("option", "", label);
        option.value = value;
        control.append(option);
      });
    });
    syncControls();
  }
  function openDrawer() {
    if (breakpoint.matches || !drawer.hidden) return;
    previousFocus = opener;
    previousOverflow = document.body.style.overflow;
    outside.forEach(element => { previousInert.set(element, element.inert); element.inert = true; });
    drawer.hidden = false;
    drawer.inert = false;
    backdrop.hidden = false;
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    opener.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closer.focus();
  }
  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.hidden = true;
    drawer.inert = true;
    backdrop.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    opener.setAttribute("aria-expanded", "false");
    outside.forEach(element => { element.inert = previousInert.get(element) || false; });
    previousInert.clear();
    document.body.style.overflow = previousOverflow;
    const focus = breakpoint.matches ? desktop.querySelector("input") : previousFocus;
    focus?.focus();
  }
  opener.addEventListener("click", openDrawer);
  closer.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  breakpoint.addEventListener("change", () => { if (breakpoint.matches) closeDrawer(); });
  drawer.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...drawer.querySelectorAll("button,select,input")].filter(element => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function metadata() {
    document.title = `${K.t("Автомобили от Корея")} | FADI CARS`;
    document.querySelector('meta[name="description"]').content = K.t("Разгледайте автомобили от Южна Корея, налични за поръчка чрез FADI CARS.");
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = document.querySelector('meta[name="description"]').content;
  }

  function card(car, index) {
    const article = K.node("article", "korea-car-card");
    const photo = K.link("", K.detailUrl(car), "korea-card-image-link");
    photo.setAttribute("aria-label", `${K.t("Виж автомобила")}: ${K.title(car)}`);
    photo.append(K.image(car.image || car.images?.[0], K.title(car), index < 2));
    article.append(photo);
    const body = K.node("div", "korea-card-content");
    body.append(K.node("span", "korea-order-label", K.t("Поръчка от Корея")));
    if (car.status === "reserved") body.append(K.node("span", "korea-reserved-label", K.t("Резервиран")));
    const heading = K.node("h2");
    heading.append(K.link(K.title(car), K.detailUrl(car), ""));
    body.append(heading);
    const meta = K.node("div", "korea-card-meta");
    [K.year(car.year), K.mileage(car), K.localized(car, "fuel"), K.localized(car, "transmission")]
      .filter(Boolean).forEach(value => meta.append(K.node("span", "", value)));
    body.append(meta, K.node("strong", "korea-card-price", K.price(car)), K.link("Виж автомобила", K.detailUrl(car)));
    article.append(body);
    return article;
  }
  function render() {
    metadata();
    syncControls();
    const count = document.getElementById("koreaResultCount");
    count.textContent = "0";
    if (failed) return K.state(root, "Не успяхме да заредим автомобилите", "Моля, опитайте отново по-късно или се свържете с нас.");
    if (!loaded) { root.textContent = K.t("Зареждане на автомобили..."); return; }
    if (!cars.length) return K.state(root, "Скоро ще добавим предложения", "Междувременно можете да ни кажете какъв автомобил търсите и ще Ви съдействаме с подходящи предложения от Корея.");
    const query = state.search.trim().toLocaleLowerCase();
    const year = Number(state.year);
    const max = Number(state.price);
    const matches = cars.filter(car => (!state.make || K.text(car.make) === state.make)
      && (!state.fuel || K.text(car.fuel) === state.fuel)
      && (!state.transmission || K.text(car.transmission) === state.transmission)
      && (!query || [car.title, K.title(car), car.make, car.model, car.trim].join(" ").toLocaleLowerCase().includes(query))
      && (!year || (Number.isFinite(car.year) && car.year >= year))
      && (!max || (Number.isFinite(car.price) && car.price <= max)));
    const [field, direction] = { "year-desc": ["year", -1], "price-asc": ["price", 1], "price-desc": ["price", -1], "mileage-asc": ["mileage", 1] }[sort.value] || ["year", -1];
    matches.sort((a, b) => {
      const av = Number.isFinite(a[field]) && a[field] >= 0 ? a[field] : null;
      const bv = Number.isFinite(b[field]) && b[field] >= 0 ? b[field] : null;
      // Unknown numeric values stay last for every sort direction.
      if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
      return (av - bv) * direction || K.title(a).localeCompare(K.title(b));
    });
    count.textContent = String(matches.length);
    if (!matches.length) return K.state(root, "Няма автомобили по тези критерии", "Променете филтрите или изпратете запитване.");
    const grid = K.node("div", "korea-car-grid");
    matches.forEach((car, index) => grid.append(card(car, index)));
    root.replaceChildren(grid);
  }
  controls.forEach(control => control.addEventListener("input", () => {
    state[control.dataset.koreaFilter] = control.value;
    render();
  }));
  sort.addEventListener("input", render);
  desktop.addEventListener("submit", event => event.preventDefault());
  mobile.addEventListener("submit", event => { event.preventDefault(); closeDrawer(); });
  document.querySelectorAll("[data-korea-clear]").forEach(button => button.addEventListener("click", () => {
    Object.keys(state).forEach(field => { state[field] = ""; });
    sort.value = "year-desc";
    render();
  }));
  document.addEventListener("fadi:languagechange", () => {
    fillOptions();
    render();
  });
  K.load().then(records => {
    cars = records.filter(K.active);
    fillOptions();
    loaded = true;
    render();
  }).catch(() => { failed = true; render(); });
  fillOptions();
  render();
})();
