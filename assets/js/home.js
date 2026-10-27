(async () => {
  const core = window.FadiCore;
  const cars = await core.getCatalogue();


  const latest = [...cars]
    .sort((a,b) => (b.year || 0) - (a.year || 0) || (b.price || 0) - (a.price || 0))
    .slice(0, 8);

  const grid = document.querySelector("#latestCars");
  grid.innerHTML = latest.map(core.vehicleCard).join("");
  core.activateImageFallbacks(grid);

  document.addEventListener("fadi:languagechange", () => {
    grid.innerHTML = latest.map(core.vehicleCard).join("");
    core.activateImageFallbacks(grid);
  });

  document.querySelector("#homeSearchForm").addEventListener("submit", event => {
    event.preventDefault();
    const query = document.querySelector("#homeSearchInput").value.trim();
    location.href = `/cars?q=${encodeURIComponent(query)}`;
  });
})();

// Korea preview is independent of the Mobile.bg stock request.
(() => {
  const K = window.FadiKorea;
  const root = document.getElementById("homeKoreaCars");
  const curatedIds = [
    "bmw-nextauto-1107736",
    "porsche-nextauto-1216653",
    "mercedes-benz-nextauto-1150677",
    "audi-nextauto-1169742",
    "hyundai-nextauto-1288545",
    "lexus-nextauto-1206535"
  ];
  let cars = [], loaded = false, failed = false;
  function render() {
    root.setAttribute("aria-busy", String(!loaded && !failed));
    const description = window.FadiI18n.t("Налични автомобили в София и поръчка на автомобили от Южна Корея с проверка и доставка до България от FADI CARS.");
    document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]').forEach(meta => { meta.content = description; });
    if (failed) return K.state(root, "Не успяхме да заредим автомобилите", "Моля, опитайте отново по-късно или се свържете с нас.");
    if (!loaded) { root.textContent = K.t("Зареждане на автомобили..."); return; }
    if (!cars.length) return K.state(root, "Скоро ще добавим предложения", "Междувременно можете да ни кажете какъв автомобил търсите и ще Ви съдействаме с подходящи предложения от Корея.");
    const grid = K.node("div", "korea-car-grid");
    cars.forEach((car, index) => grid.append(K.card(car, index, true)));
    root.replaceChildren(grid);
  }
  document.addEventListener("fadi:languagechange", render);
  render();
  K.load().then(records => {
    const available = records.filter(car => car.status === "available");
    const byId = new Map(available.map(car => [car.id, car]));
    cars = curatedIds.map(id => byId.get(id)).filter(Boolean);
    const selectedIds = new Set(cars.map(car => car.id));
    const fallback = [...available].sort((a, b) => (b.year || 0) - (a.year || 0));
    for (const car of fallback) {
      if (cars.length >= 6) break;
      if (selectedIds.has(car.id)) continue;
      cars.push(car);
      selectedIds.add(car.id);
    }
    loaded = true;
    render();
  }).catch(() => { failed = true; render(); });
})();
