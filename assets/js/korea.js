(() => {
  const form = document.getElementById("koreaEnquiryForm");
  const status = document.getElementById("koreaFormStatus");
  if (!form || !status) return;
  const K = window.FadiKorea;
  const preview = document.getElementById("koreaPreview");
  let previewCars;
  let previewFailed = false;
  function renderPreview() {
    if (!preview) return;
    if (previewFailed) {
      const message = K.node("p", "korea-preview-message", K.t("Предложенията временно не могат да се заредят."));
      preview.replaceChildren(message);
      return; // The permanent catalogue link remains available below the preview.
    }
    if (!previewCars) { preview.textContent = K.t("Зареждане на автомобили..."); return; }
    if (!previewCars.length) { preview.textContent = K.t("Скоро ще добавим предложения"); return; }
    const grid = K.node("div", "korea-car-grid");
    previewCars.forEach((car, index) => grid.append(K.card(car, index, true)));
    preview.replaceChildren(grid);
  }
  if (preview) {
    K.load().then(records => {
      previewCars = records.filter(K.active).slice(0, 6);
      renderPreview();
    }).catch(() => { previewFailed = true; renderPreview(); });
    document.addEventListener("fadi:languagechange", renderPreview);
    renderPreview();
  }
  const selectedPanel = document.getElementById("koreaSelectedVehicle");
  const selectedId = new URLSearchParams(location.search).get("car");
  let selectedCar;
  let prefilledTitle = "";
  let selectedError = "";
  function renderSelected() {
    if (!selectedPanel) return;
    selectedPanel.replaceChildren();
    selectedPanel.hidden = !selectedCar && !selectedError;
    if (selectedCar) {
      selectedPanel.append(K.node("span", "", K.t("Запитване за:")), K.node("strong", "", K.title(selectedCar)), K.node("span", "", K.price(selectedCar)));
    } else if (selectedError) selectedPanel.textContent = K.t(selectedError);
  }
  if (selectedId) {
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    K.load().then(records => {
      selectedCar = records.find(car => car.id === selectedId && K.active(car));
      if (selectedCar) {
        if (!form.elements.vehicle.value) {
          prefilledTitle = K.title(selectedCar);
          form.elements.vehicle.value = prefilledTitle;
        }
        if (!form.elements.link.value) form.elements.link.value = `https://www.fadicars.com${K.detailUrl(selectedCar)}`;
      } else selectedError = "Избраният автомобил вече не е наличен. Кажете ни какво търсите.";
    }).catch(() => { selectedError = "Не успяхме да заредим избрания автомобил. Можете да попълните запитването."; })
      .finally(() => { renderSelected(); submit.disabled = false; });
  }
  document.addEventListener("fadi:languagechange", () => {
    // Preserve customer edits; only translate an untouched vehicle prefill.
    if (selectedCar && prefilledTitle && form.elements.vehicle.value === prefilledTitle) {
      prefilledTitle = K.title(selectedCar);
      form.elements.vehicle.value = prefilledTitle;
    }
    renderSelected();
  });

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

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const t = value => window.FadiI18n?.t(value) || value;
    const lines = [
      `${t("Име")}: ${values.get("name") || ""}`,
      `${t("Телефон")}: ${values.get("phone") || ""}`,
      `${t("Марка / модел")}: ${values.get("vehicle") || ""}`
    ];
    if (selectedCar) {
      lines.unshift(`${t("Запитване за:")} ${K.title(selectedCar)}`, `${t("Идентификатор")}: ${selectedCar.id}`, `${t("Цена")}: ${K.price(selectedCar)}`);
    }
    [["Бюджет", "budget"], ["Година от", "year"], ["Линк към автомобил", "link"]].forEach(([label, field]) => {
      const value = String(values.get(field) || "").trim();
      if (value) lines.push(`${t(label)}: ${value}`);
    });

    const phone = window.FADI_CONFIG?.phoneHref;
    if (!phone) {
      status.textContent = t("Телефонът за контакт временно не е наличен.");
      return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await copyText(lines.join("\n"));
      status.textContent = t("Информацията е копирана. Отваряме обаждане към FADI CARS...");
    } catch (_) {
      status.textContent = t("Отваряме обаждане към FADI CARS. Въведената информация остава във формата.");
    }
    button.disabled = false;
    window.location.href = `tel:${phone}`;
  });
})();
