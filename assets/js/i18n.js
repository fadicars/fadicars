(() => {
  const entries = [
    ["Начало", "Home"], ["Автомобили", "Vehicles"], ["Коли", "Cars"], ["Лизинг", "Leasing"], ["Контакти", "Contact"], ["Продажби", "Sales"],
    ["Отвори меню", "Open menu"], ["Мобилна навигация", "Mobile navigation"], ["Навигация", "Navigation"], ["Език", "Language"],
    ["Автомобили в наличност, директен контакт и съдействие при покупка.", "Vehicles in stock, direct contact and purchase assistance."],
    ["Потвърди цената и наличността по телефона.", "Confirm the price and availability by phone."],
    ["Автомобили в наличност", "Vehicles in stock"], ["Разгледай актуалните предложения на автокъща FADI CARS в София.", "Explore the latest vehicles available from FADI CARS in Sofia."],
    ["обяви", "listings"], ["Какъв автомобил търсиш?", "What kind of vehicle are you looking for?"], ["Търси", "Search"],
    ["Всички автомобили", "All vehicles"], ["Филтри, цени и снимки", "Filters, prices and photos"], ["Възможности за финансиране", "Financing options"], ["FADI CARS / ФАДИ КАРС • СОФИЯ", "FADI CARS • SOFIA"],
    ["Посети ни", "Visit us"], ["София, Суходол", "Sofia, Suhodol"], ["ПОСЛЕДНО ДОБАВЕНИ", "LATEST ARRIVALS"], ["Актуални предложения", "Latest vehicles"], ["Виж всички", "View all"],
    ["КАТАЛОГ", "CATALOGUE"], ["Филтрирай бързо и отвори пълната галерия.", "Filter quickly and open the full gallery."], ["автомобила", "vehicles"],
    ["Марка или модел", "Make or model"], ["Филтри", "Filters"], ["Марка", "Make"], ["Гориво", "Fuel"], ["Скорости", "Transmission"], ["Тип", "Body type"],
    ["Максимална цена", "Maximum price"], ["Всички марки", "All makes"], ["Всички горива", "All fuels"], ["Всички типове", "All body types"], ["Всички", "All"],
    ["Без ограничение", "No limit"], ["Без лимит", "No limit"], ["Изчисти", "Clear"], ["Покажи резултатите", "Show results"], ["Търсене", "Search"], ["Цена до", "Price up to"],
    ["До 5 000 €", "Up to €5,000"], ["До 10 000 €", "Up to €10,000"], ["До 15 000 €", "Up to €15,000"], ["До 25 000 €", "Up to €25,000"], ["До 50 000 €", "Up to €50,000"],
    ["резултата", "results"], ["Подреди", "Sort"], ["Най-нови", "Newest"], ["Цена ↑", "Price ↑"], ["Цена ↓", "Price ↓"], ["Пробег ↑", "Mileage ↑"],
    ["Няма автомобили по избраните критерии.", "No vehicles match the selected criteria."],
    ["Зареждаме автомобила...", "Loading vehicle..."], ["Цена", "Price"], ["Увеличи", "Enlarge"], ["Продавач", "Seller"], ["Сподели", "Share"], ["Линкът е копиран", "Link copied"], ["Отвори автомобила", "Open vehicle"],
    ["Карта и адрес", "Map and address"], ["Потвърди наличността и цената по телефона.", "Confirm availability and price by phone."],
    ["Технически данни", "Specifications"], ["АКТУАЛНИ ДАННИ", "LIVE DATA"], ["ОСНОВНИ ДАННИ", "BASIC DATA"], ["Описание", "Description"], ["Оборудване", "Equipment"],
    ["← Предишен автомобил", "← Previous vehicle"], ["Следващ автомобил →", "Next vehicle →"], ["Навигация между автомобилите", "Vehicle navigation"],
    ["ОЩЕ ПРЕДЛОЖЕНИЯ", "MORE VEHICLES"], ["Подобни автомобили", "Similar vehicles"], ["Обади се", "Call"], ["Автомобил", "Vehicle"], ["Сподели автомобила", "Share vehicle"], ["Предишен автомобил", "Previous vehicle"], ["Следващ автомобил", "Next vehicle"],
    ["Дата на производство", "Production date"], ["Двигател", "Engine"], ["Мощност", "Power"], ["Кубатура", "Engine capacity"], ["Скоростна кутия", "Transmission"],
    ["Пробег", "Mileage"], ["Категория", "Category"], ["Цвят", "Colour"], ["Евростандарт", "Euro standard"], ["Автомобилът не е намерен.", "Vehicle not found."], ["Към каталога", "Back to catalogue"],
    ["За актуална информация относно състоянието, обслужването и условията за покупка се свържете директно с FADI CARS.", "For current information about the vehicle's condition, service history and purchase terms, contact FADI CARS directly."],
    ["Свържете се с продавача за пълния списък с оборудване.", "Contact the seller for the full equipment list."], ["Снимка", "Photo"], ["снимка", "photo"],
    ["Пълната галерия и актуалните данни се зареждат след публикуване във Vercel.", "The full gallery and current data load after the site is published to Vercel."],
    ["Налична е една снимка за този автомобил.", "One photo is available for this vehicle."], ["Актуалната галерия временно не може да се зареди. Потвърдете данните и наличността по телефона.", "The current gallery is temporarily unavailable. Please confirm the details and availability by phone."],
    ["ФИНАНСИРАНЕ", "FINANCING"], ["Гъвкави решения за финансиране", "Flexible financing solutions"], ["Лизинг без доказване на доходи", "Leasing without proof of income"],
    ["Предлагаме възможност за закупуване на избрани автомобили чрез лизинг при ясни условия и съдействие през целия процес. Нашият екип ще Ви помогне да изберете най-подходящото решение според Вашите нужди и възможности.", "We offer financing for selected vehicles with clear terms and support throughout the process. Our team will help you choose the option that best suits your needs and circumstances."],
    ["Първоначална вноска", "Initial payment"], ["Лизинговото финансиране започва с минимална първоначална вноска от 25% от стойността на автомобила.", "Lease financing starts with a minimum initial payment of 25% of the vehicle price."],
    ["До 36 месеца срок на финансиране", "Financing term up to 36 months"], ["Възможност за избор на срок до 36 месеца, съобразен с индивидуалните Ви предпочитания.", "Choose a financing term of up to 36 months to suit your individual preferences."],
    ["Съдействие при кандидатстване", "Application assistance"], ["Оказваме съдействие при подготовката на необходимите документи и комуникацията с лизинговия партньор.", "We assist with preparing the required documents and communicating with the leasing partner."],
    ["УСЛОВИЯ", "TERMS"], ["Допълнителни разходи", "Additional costs"], ["При закупуване на автомобил чрез лизинг към първоначалната вноска се добавят стандартните разходи, свързани с регистрацията и подготовката на автомобила:", "When purchasing a vehicle through leasing, the standard registration and preparation costs are added to the initial payment:"],
    ["Регистрация в КАТ", "Traffic Police registration"], ["Застраховка „Гражданска отговорност“", "Third-party liability insurance"], ["Застраховка „Каско“", "Comprehensive insurance"], ["Административни такси", "Administrative fees"],
    ["Точният размер на разходите зависи от избрания автомобил и условията на финансиране.", "The exact costs depend on the selected vehicle and financing terms."],
    ["СТЪПКИ", "STEPS"], ["Как протича процесът", "How the process works"], ["Избирате автомобил", "Choose a vehicle"], ["Избирате автомобил от нашия каталог.", "Choose a vehicle from our catalogue."],
    ["Условия за финансиране", "Financing terms"], ["Обсъждаме подходящите условия за финансиране.", "We discuss suitable financing terms."], ["Документи", "Documents"], ["Подготвяме необходимите документи.", "We prepare the required documents."],
    ["Получавате автомобила", "Receive your vehicle"], ["След одобрение финализираме сделката и организираме предаването на автомобила.", "After approval, we finalise the transaction and arrange vehicle handover."],
    ["ВТОРА ОПЦИЯ", "SECOND OPTION"], ["Финансиране чрез TBI Bank", "Financing through TBI Bank"], ["Без първоначална вноска", "No initial payment"], ["До 96 месеца", "Up to 96 months"],
    ["Гъвкави погасителни планове до 96 месеца", "Flexible repayment plans of up to 96 months"], ["Без залог на МПС", "No vehicle collateral"], ["Без задължително КАСКО", "No mandatory comprehensive insurance"],
    ["Отговор за кредита в рамките на минути", "Credit decision within minutes"], ["Подписвате договора електронно, без да посещавате офис на банката", "Sign the agreement electronically without visiting a bank branch"], ["Превозното средство става Ваше веднага", "The vehicle becomes yours immediately"],
    ["Без допълнителни пълномощни", "No additional powers of attorney"], ["Без допълнителни такси за прехвърляне след изплащане на кредита", "No additional transfer fees after the loan is repaid"], ["Възможност за допълнителна защита чрез застраховки", "Optional additional protection through insurance"],
    ["Имате въпроси?", "Have questions?"], ["Ако желаете повече информация относно възможностите за лизинг или конкретен автомобил, свържете се с нашия екип. Ще Ви съдействаме при избора на най-подходящото решение.", "For more information about financing options or a specific vehicle, contact our team. We will help you choose the most suitable option."],
    ["Разгледайте автомобилите", "Browse vehicles"], ["Обадете се", "Call us"],
    ["КОНТАКТИ", "CONTACT"], ["Свържи се с FADI CARS / ФАДИ КАРС", "Contact FADI CARS"], ["Обади се за наличност, оглед, цена или възможност за лизинг.", "Call us about availability, viewings, prices or financing options."],
    ["Телефон", "Phone"], ["Натисни за обаждане", "Tap to call"], ["Имейл", "Email"], ["Изпрати запитване", "Send an enquiry"], ["Адрес", "Address"], ["Отвори Google Maps", "Open Google Maps"],
    ["Работно време", "Opening hours"], ["Понеделник – Събота: 09:00 – 19:00", "Monday – Saturday: 09:00 – 19:00"], ["Неделя: 10:00 – 17:00", "Sunday: 10:00 – 17:00"],
    ["Каталог", "Catalogue"], ["Филтри и вътрешни страници", "Filters and vehicle pages"], ["FADI CARS карта", "FADI CARS map"]
  ];
  const dictionary = new Map(entries);
  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const storageKey = "fadi-language";
  let storedLanguage = "";
  try { storedLanguage = localStorage.getItem(storageKey) || ""; } catch (_) {}
  let language = storedLanguage === "en" ? "en" : "bg";

  function t(value) {
    return language === "en" ? (dictionary.get(value) || value) : value;
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("[data-i18n-ignore]")) continue;
      const current = node.nodeValue.trim();
      if (!originals.has(node) && dictionary.has(current)) originals.set(node, node.nodeValue);
      const original = originals.get(node);
      if (!original) continue;
      const originalTrimmed = original.trim();
      node.nodeValue = language === "en" ? original.replace(originalTrimmed, dictionary.get(originalTrimmed)) : original;
    }
    root.querySelectorAll?.("[placeholder],[aria-label],[title]").forEach(element => {
      if (element.closest("[data-i18n-ignore]")) return;
      const stored = attributeOriginals.get(element) || {};
      ["placeholder", "aria-label", "title"].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        if (!(attribute in stored)) stored[attribute] = element.getAttribute(attribute);
        element.setAttribute(attribute, language === "en" ? (dictionary.get(stored[attribute]) || stored[attribute]) : stored[attribute]);
      });
      attributeOriginals.set(element, stored);
    });
    document.querySelectorAll("[data-language]").forEach(button => {
      const active = button.dataset.language === language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(next) {
    const selected = next === "en" ? "en" : "bg";
    if (selected === language) return;
    language = selected;
    try { localStorage.setItem(storageKey, language); } catch (_) {}
    apply();
    document.dispatchEvent(new CustomEvent("fadi:languagechange", { detail: { language } }));
  }

  function init() {
    document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language)));
    apply();
  }

  window.FadiI18n = { init, apply, t, setLanguage, getLanguage: () => language };
})();
