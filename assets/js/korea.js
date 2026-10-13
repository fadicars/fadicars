(() => {
  const form = document.getElementById("koreaEnquiryForm");
  const status = document.getElementById("koreaFormStatus");
  if (!form || !status) return;

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
