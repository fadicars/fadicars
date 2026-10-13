(() => {
  const K = window.FadiKorea;
  const root = document.getElementById("koreaDetail");
  if (!root) return;
  let car;
  let failed = false;
  let loaded = false;
  let selectedImage = 0;

  function metadata() {
    const title = car ? `${K.title(car)} | ${K.t("Автомобили от Корея")} | FADI CARS` : `${K.t("Автомобил от Корея")} | FADI CARS`;
    const description = car ? `${K.title(car)}. ${K.t("Автомобилът се предлага по поръчка от Южна Корея.")} ${K.price(car)}` : K.t("Автомобили от Южна Корея по поръчка чрез FADI CARS.");
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = description;
    const canonical = `https://www.fadicars.com${car ? K.detailUrl(car) : "/korea-car"}`;
    document.querySelector('link[rel="canonical"]').href = canonical;
    document.querySelector('meta[property="og:url"]').content = canonical;
  }
  function render() {
    metadata();
    if (failed) return K.state(root, "Не успяхме да заредим автомобилите", "Моля, опитайте отново по-късно или се свържете с нас.", true);
    if (!loaded) { root.textContent = K.t("Зареждане на автомобили..."); return; }
    if (!car) return K.state(root, "Автомобилът не е намерен", "", true);
    const layout = K.node("div", "korea-detail-layout");
    const gallery = K.node("section", "korea-detail-gallery");
    gallery.setAttribute("aria-label", K.t("Снимки"));
    const images = [...new Set([car.image, ...(Array.isArray(car.images) ? car.images : [])].map(K.imageUrl).filter(Boolean))];
    const main = K.node("div", "korea-detail-main-image");
    main.append(K.image(images[selectedImage], K.title(car), true));
    gallery.append(main);
    if (images.length > 1) {
      const thumbnails = K.node("div", "korea-detail-thumbnails");
      images.forEach((url, index) => {
        const button = K.node("button", "korea-detail-thumbnail");
        button.type = "button";
        button.setAttribute("aria-label", `${K.t("Снимка")} ${index + 1}`);
        button.setAttribute("aria-pressed", String(index === selectedImage));
        button.append(K.image(url, ""));
        button.addEventListener("click", () => {
          selectedImage = index;
          main.replaceChildren(K.image(url, K.title(car), true));
          thumbnails.querySelectorAll("button").forEach((item, i) => item.setAttribute("aria-pressed", String(i === index)));
        });
        thumbnails.append(button);
      });
      gallery.append(thumbnails);
    }
    const summary = K.node("section", "korea-detail-summary");
    summary.append(K.node("span", "korea-order-label", K.t("Поръчка от Корея")));
    if (car.status === "reserved") summary.append(K.node("span", "korea-reserved-label", K.t("Резервиран")));
    summary.append(K.node("h1", "", K.title(car)), K.node("strong", "korea-detail-price", K.price(car)));
    const specs = K.node("dl", "korea-detail-specs");
    const fields = [["Година", K.year(car.year)], ["Пробег", K.mileage(car)], ["Гориво", K.localized(car, "fuel")],
      ["Двигател", K.localized(car, "engine")], ["Скоростна кутия", K.localized(car, "transmission")],
      ["Цвят", K.localized(car, "color")], ["Местоположение", K.localized(car, "location") || K.t("Южна Корея")]];
    fields.forEach(([label, value]) => {
      const item = K.node("div");
      item.append(K.node("dt", "", K.t(label)), K.node("dd", "", value || "—"));
      specs.append(item);
    });
    summary.append(specs, K.link("Запитване за този автомобил", K.enquiryUrl(car), "button button-red"));
    const phone = window.FADI_CONFIG?.phoneHref;
    if (phone) summary.append(K.link("Обади се", `tel:${phone}`));
    summary.append(K.node("p", "korea-detail-note", K.t("Автомобилът се предлага по поръчка от Южна Корея.")));
    layout.append(gallery, summary);
    root.replaceChildren(layout);
    const content = K.node("section", "korea-detail-content");
    // Optional English fields let manually written/imported free text be bilingual.
    const english = window.FadiI18n.getLanguage() === "en";
    const description = english ? K.text(car.descriptionEn) : K.text(car.description);
    if (description) content.append(K.node("h2", "", K.t("Описание")), K.node("p", "korea-detail-description", description));
    const features = english ? car.featuresEn : car.features;
    if (Array.isArray(features) && features.some(value => K.text(value))) {
      content.append(K.node("h2", "", K.t("Оборудване")));
      const list = K.node("ul", "korea-detail-features");
      features.filter(value => K.text(value)).forEach(value => list.append(K.node("li", "", value)));
      content.append(list);
    }
    if (english && ((!car.descriptionEn && car.description) || (!car.featuresEn && car.features?.length))) {
      content.append(K.node("p", "korea-detail-note", K.t("Допълнителна информация за автомобила е налична при запитване.")));
    }
    root.append(content);
    // source/sourceUrl/notes are internal and are never rendered to customers.
  }
  document.addEventListener("fadi:languagechange", render);
  const id = new URLSearchParams(location.search).get("id");
  K.load().then(records => { car = records.find(item => item.id === id && K.active(item)); loaded = true; render(); })
    .catch(() => { failed = true; render(); });
  render();
})();
