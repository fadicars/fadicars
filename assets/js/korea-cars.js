(() => {
  const K = window.FadiKorea;
  const root = document.getElementById("koreaCatalogue");
  const filters = document.getElementById("koreaFilters");
  if (!root || !filters) return;
  let cars = [];
  let loaded = false;
  let failed = false;
  const make = filters.elements.make;
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
    if (failed) return K.state(root, "Не успяхме да заредим автомобилите", "Моля, опитайте отново по-късно или се свържете с нас.");
    if (!loaded) { root.textContent = K.t("Зареждане на автомобили..."); return; }
    if (!cars.length) return K.state(root, "Скоро ще добавим предложения", "Междувременно можете да ни кажете какъв автомобил търсите и ще Ви съдействаме с подходящи предложения от Корея.");
    const query = filters.elements.search.value.trim().toLocaleLowerCase();
    const year = Number(filters.elements.year.value);
    const max = Number(filters.elements.price.value);
    const matches = cars.filter(car => (!make.value || K.text(car.make) === make.value)
      && (!query || [K.title(car), car.make, car.model, car.trim].join(" ").toLocaleLowerCase().includes(query))
      && (!year || (Number.isFinite(car.year) && car.year >= year))
      && (!max || (Number.isFinite(car.price) && car.price <= max)));
    if (!matches.length) return K.state(root, "Няма автомобили по тези критерии", "Променете филтрите или изпратете запитване.");
    const grid = K.node("div", "korea-car-grid");
    matches.forEach((car, index) => grid.append(card(car, index)));
    root.replaceChildren(grid);
  }
  filters.addEventListener("input", render);
  filters.addEventListener("submit", event => event.preventDefault());
  filters.addEventListener("reset", () => setTimeout(render, 0));
  document.addEventListener("fadi:languagechange", () => {
    make.options[0].textContent = K.t("Всички марки");
    render();
  });
  K.load().then(records => {
    cars = records.filter(K.active);
    [...new Set(cars.map(car => K.text(car.make)).filter(Boolean))].sort().forEach(value => {
      const option = K.node("option", "", value);
      option.value = value;
      make.append(option);
    });
    loaded = true;
    render();
  }).catch(() => { failed = true; render(); });
  render();
})();
