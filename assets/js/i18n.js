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
    ["Каталог", "Catalogue"], ["Филтри и вътрешни страници", "Filters and vehicle pages"], ["FADI CARS карта", "FADI CARS map"],
    ["Поръчай автомобил", "Order a car"], ["Автомобили от Корея", "Vehicles from Korea"], ["Поръчка, проверка и доставка", "Order, inspection and delivery"],
    ["АВТОМОБИЛИ ОТ КОРЕЯ", "VEHICLES FROM KOREA"], ["Поръчайте автомобил от Корея", "Order a car from Korea"],
    ["Избирате автомобил. Ние организираме проверката, покупката, транспорта и доставката до България.", "You choose a vehicle. We arrange the inspection, purchase, transport and delivery to Bulgaria."],
    ["Разгледай автомобили", "Browse vehicles"], ["Основни предимства", "Key benefits"], ["Проверка преди покупка", "Pre-purchase inspection"],
    ["Договор", "Contract"], ["Проследим процес", "A transparent process"], ["Доставка до България", "Delivery to Bulgaria"],
    ["АВТОМОБИЛИ", "VEHICLES"], ["Предложенията се подготвят", "Vehicle listings are being prepared"],
    ["Дотогава ни кажете какъв автомобил търсите и ще започнем от Вашите изисквания.", "In the meantime, tell us what vehicle you are looking for and we will start with your requirements."],
    ["Кажете ни какво търсите", "Tell us what you are looking for"], ["КАК РАБОТИ", "HOW IT WORKS"], ["Поръчката стъпка по стъпка", "Your order, step by step"],
    ["Изберете автомобил от нашите предложения или ни кажете какво търсите.", "Choose a vehicle from our listings or tell us what you are looking for."],
    ["Проверяваме автомобила", "We inspect the vehicle"],
    ["Преди покупка организираме проверка и Ви предоставяме наличната информация за състоянието, снимки, видео и история на автомобила.", "Before purchase, we arrange an inspection and provide the available information about the vehicle's condition, photos, video and history."],
    ["250 € депозит за проверка", "€250 inspection deposit"], ["При покупка сумата се приспада от крайната цена.", "If you purchase the vehicle, this amount is deducted from the final price."],
    ["Вие решавате", "You decide"], ["Нищо не се купува без Вашето одобрение.", "Nothing is purchased without your approval."],
    ["След проверката получавате резултатите и офертата. Продължаваме само след Вашето потвърждение.", "After the inspection, you receive the results and the offer. We proceed only after you confirm."],
    ["Договор и 30% плащане", "Contract and 30% payment"],
    ["След одобрение подписваме договор и се заплащат 30% от договорената сума. След това автомобилът се закупува и подготвя за транспорт.", "After approval, we sign a contract and 30% of the agreed amount is paid. The vehicle is then purchased and prepared for transport."],
    ["Транспорт до България", "Transport to Bulgaria"],
    ["Организираме покупката, подготовката за износ и транспорта до България, като Ви държим информирани за процеса.", "We arrange the purchase, export preparation and transport to Bulgaria, keeping you informed throughout the process."],
    ["Пристигане и получаване", "Arrival and handover"],
    ["След пристигането на автомобила в България се заплащат оставащите 70% преди предаването.", "Once the vehicle arrives in Bulgaria, the remaining 70% is paid before handover."],
    ["ПРЕДИ ДА КАЖЕТЕ „ДА“", "BEFORE YOU SAY YES"], ["Получавате информацията, преди да вземете решение", "You receive the information before making a decision"],
    ["Снимки", "Photos"], ["Реални снимки на автомобила.", "Real photos of the vehicle."], ["Видео", "Video"],
    ["Видео от автомобила при наличие или при организирана проверка.", "Vehicle video when available or as part of an arranged inspection."],
    ["Състояние", "Condition"], ["Информация за видимото техническо и визуално състояние.", "Information about the visible technical and cosmetic condition."],
    ["История", "History"], ["Наличната информация за историята и предишни щети.", "Available information about the vehicle's history and previous damage."],
    ["Проверка на заявеното оборудване и основните характеристики.", "Verification of the listed equipment and key specifications."],
    ["Вашето одобрение", "Your approval"], ["Автомобилът не се закупува преди Вашето потвърждение.", "The vehicle is not purchased before you confirm."],
    ["ПЛАЩАНЕ", "PAYMENT"], ["Три ясни етапа", "Three clear stages"], ["Проверка", "Inspection"], ["Приспада се при покупка", "Deducted if you purchase"],
    ["След одобрение и договор", "After approval and contract"], ["След пристигане в България", "After arrival in Bulgaria"],
    ["ЗАПИТВАНЕ", "ENQUIRY"], ["Не сте избрали автомобил?", "Haven't chosen a vehicle?"],
    ["Кажете ни какво търсите. Марка, модел, приблизителен бюджет и година са достатъчни, за да започнем.", "Tell us what you are looking for. A make, model, approximate budget and year are enough to get started."],
    ["Оставете основната информация и ще се свържем с Вас, за да уточним автомобила и следващите стъпки.", "Leave the basic information and we will contact you to discuss the vehicle and the next steps."],
    ["Име", "Name"], ["Марка / модел", "Make / model"], ["Бюджет", "Budget"], ["Година от", "Year from"],
    ["Линк към автомобил", "Vehicle link"], ["Линк към автомобил (по желание)", "Vehicle link (optional)"],
    ["Копирай и се обади", "Copy and call"], ["Информацията ще бъде копирана, след което ще се отвори обаждане към FADI CARS.", "Your information will be copied, then a call to FADI CARS will open."],
    ["Информацията е копирана. Отваряме обаждане към FADI CARS...", "Information copied. Opening a call to FADI CARS..."],
    ["Отваряме обаждане към FADI CARS. Въведената информация остава във формата.", "Opening a call to FADI CARS. The information you entered remains in the form."],
    ["Телефонът за контакт временно не е наличен.", "The contact phone number is temporarily unavailable."],
    ["ВАЖНО Е ДА ЗНАЕТЕ", "GOOD TO KNOW"], ["Често задавани въпроси", "Frequently asked questions"],
    ["Какво точно се проверява преди покупка?", "What exactly is checked before purchase?"],
    ["Според конкретния автомобил и организираната проверка се преглеждат и предоставят наличната информация за състоянието, снимки, видео, история и други относими данни.", "Depending on the specific vehicle and arranged inspection, available condition information, photos, video, history and other relevant details are reviewed and provided."],
    ["Какво става, ако не одобря автомобила след проверката?", "What happens if I do not approve the vehicle after the inspection?"],
    ["Покупката не продължава без Вашето одобрение. Условията за депозита се уточняват преди организиране на проверката.", "The purchase does not proceed without your approval. The deposit terms are clarified before the inspection is arranged."],
    ["Колко време отнема доставката?", "How long does delivery take?"],
    ["Срокът зависи от конкретния автомобил, графика за транспорт и логистиката. Информация за очаквания срок се предоставя по време на поръчката.", "Timing depends on the specific vehicle, shipping schedule and logistics. An expected timeframe is provided during the order process."],
    ["Какво включва цената?", "What does the price include?"],
    ["Преди да потвърдите поръчката, получавате офертата и договорените разходи за конкретния автомобил.", "Before confirming the order, you receive the offer and agreed costs for the specific vehicle."],
    ["Мога ли да поръчам автомобил, който не е публикуван на сайта?", "Can I order a vehicle that is not listed on the website?"],
    ["Да. Изпратете марка, модел, година, приблизителен бюджет или линк към автомобил.", "Yes. Send us a make, model, year, approximate budget or a link to a vehicle."],
    ["Как ще получавам информация за автомобила?", "How will I receive updates about the vehicle?"],
    ["FADI CARS Ви държи информирани по време на процеса и предоставя относимите актуализации и налична информация.", "FADI CARS keeps you informed throughout the process and provides relevant updates and available information."],
    ["Готови сте да потърсим автомобил?", "Ready for us to find a vehicle?"], ["Свържете се с нас и кажете какво търсите.", "Contact us and tell us what you are looking for."]
  ];
  entries.push(
    ["Виж всички автомобили", "View all vehicles"],
    ["Предложенията временно не могат да се заредят.", "Vehicle offers are temporarily unavailable."],
    ["Избирате предложение от сайта или ни изпращате автомобил, който сте намерили.", "Choose a listing from the website or send us a vehicle you have found."],
    ["Организираме проверка и получавате наличната информация, снимки и видео.", "We arrange an inspection and you receive the available information, photos and video."],
    ["При покупка се приспада от крайната цена.", "Deducted from the final price if you purchase."],
    ["Вие одобрявате", "You approve"], ["Продължаваме само след Вашето потвърждение.", "We proceed only after you confirm."],
    ["Договор и 30%", "Contract and 30%"],
    ["След одобрение подписваме договор и се заплащат 30% от договорената сума.", "After approval, we sign a contract and 30% of the agreed amount is paid."],
    ["Транспорт", "Transport"], ["Организираме покупката, износа и транспорта до България.", "We arrange the purchase, export and transport to Bulgaria."],
    ["Получаване и 70%", "Handover and 70%"],
    ["Останалите 70% се заплащат след пристигането в България, преди предаването.", "The remaining 70% is paid after arrival in Bulgaria, before handover."],
    ["Какво се проверява?", "What is inspected?"],
    ["Според автомобила и проверката получавате наличните снимки, видео и информация за състоянието, историята и оборудването.", "Depending on the vehicle and inspection, you receive available photos, video and information about condition, history and equipment."],
    ["Срокът зависи от автомобила и транспорта. Очакваният срок се уточнява при поръчката.", "Timing depends on the vehicle and transport. The expected timeframe is clarified when ordering."],
    ["Най-нова година", "Newest year"], ["Затвори филтрите", "Close filters"],
    ["Предишна снимка", "Previous photo"], ["Следваща снимка", "Next photo"], ["Галерия на автомобила", "Vehicle gallery"],
    ["Година", "Year"], ["Задвижване", "Drivetrain"],
    ["Поръчка от Корея","Order from Korea"],
    ["Избрани автомобили, които могат да бъдат поръчани и доставени до България.","Selected vehicles available to order and deliver to Bulgaria."],
    ["Разгледайте автомобили от Южна Корея, налични за поръчка чрез FADI CARS.","Browse vehicles from South Korea available to order through FADI CARS."],
    ["Скоро ще добавим предложения","Vehicles will be added soon"],
    ["Междувременно можете да ни кажете какъв автомобил търсите и ще Ви съдействаме с подходящи предложения от Корея.","In the meantime, tell us what vehicle you are looking for and we will help you find suitable options from Korea."],
    ["Модел / търсене","Model / search"],
    ["Търси марка или модел","Search make or model"],
    ["Максимална цена (€)","Maximum price (€)"],
    ["Изчисти филтрите","Clear filters"],
    ["Снимка предстои","Photo coming soon"],
    ["Снимка","Photo"],
    ["Виж автомобила","View vehicle"],
    ["Цена по запитване","Price on request"],
    ["Резервиран","Reserved"],
    ["км","km"],
    ["Южна Корея","South Korea"],
    ["Няма автомобили по тези критерии","No vehicles match these filters"],
    ["Променете филтрите или изпратете запитване.","Change the filters or send an enquiry."],
    ["Не успяхме да заредим автомобилите","We could not load the vehicles"],
    ["Моля, опитайте отново по-късно или се свържете с нас.","Please try again later or contact us."],
    ["Зареждане на автомобили...","Loading vehicles..."],
    ["Автомобил от Корея","Vehicle from Korea"],
    ["Автомобил от Корея | FADI CARS","Vehicle from Korea | FADI CARS"],
    ["Автомобили от Корея | FADI CARS","Vehicles from Korea | FADI CARS"],
    ["Автомобили от Южна Корея по поръчка чрез FADI CARS.","Vehicles from South Korea available to order through FADI CARS."],
    ["Автомобилът се предлага по поръчка от Южна Корея.","This vehicle is available to order from South Korea."],
    ["Запитване за този автомобил","Enquire about this vehicle"],
    ["Местоположение","Location"],
    ["Автомобилът не е намерен","Vehicle not found"],
    ["Виж автомобилите от Корея","View vehicles from Korea"],
    ["Запитване за:","Enquiry about:"],
    ["Идентификатор","Vehicle ID"],
    ["Избраният автомобил вече не е наличен. Кажете ни какво търсите.","The selected vehicle is no longer available. Tell us what you are looking for."],
    ["Не успяхме да заредим избрания автомобил. Можете да попълните запитването.","We could not load the selected vehicle. You can still fill in the enquiry."],
    ["Допълнителна информация за автомобила е налична при запитване.","Further vehicle information is available on request."],
    ["За разглеждане на автомобилите включете JavaScript или се свържете с нас.","Enable JavaScript to browse vehicles or contact us."]
  );
  const dictionary = new Map(entries);
  const vehicleValues = new Map(Object.entries({
    "дизел": "Diesel", "дизелов": "Diesel", "бензин": "Petrol", "бензинов": "Petrol",
    "хибрид": "Hybrid", "хибриден": "Hybrid", "електрически": "Electric", "газ/бензин": "LPG/Petrol",
    "газ / бензин": "LPG/Petrol", "бензин/метан": "Petrol/CNG", "бензинов/метан": "Petrol/CNG",
    "автоматична": "Automatic", "полуавтоматична": "Semi-automatic", "ръчна": "Manual",
    "джип": "SUV", "седан": "Sedan", "комби": "Estate", "хечбек": "Hatchback", "купе": "Coupé",
    "миниван": "MPV", "ван": "Van", "пикап": "Pickup", "товарен": "Commercial van",
    "товаропътнически": "Crew van", "пътнически": "Passenger van", "микробус": "Minibus",
    "предно": "Front-wheel drive", "предно предаване": "Front-wheel drive", "задно": "Rear-wheel drive",
    "задно предаване": "Rear-wheel drive", "4x4": "4x4", "4х4": "4x4", "4wd": "4WD", "awd": "AWD",
    "черен": "Black", "черен металик": "Black metallic", "бял": "White", "сив": "Grey",
    "сребърен": "Silver", "син": "Blue", "тъмно син": "Dark blue", "тъмно син мет.": "Dark blue metallic",
    "светло син": "Light blue", "тъмно сив": "Dark grey", "сив металик": "Grey metallic", "червен": "Red", "зелен": "Green",
    "кафяв": "Brown", "бежов": "Beige", "жълт": "Yellow", "оранжев": "Orange", "лилав": "Purple",
    "бордо": "Burgundy", "металик": "Metallic"
  }));
  const months = new Map(Object.entries({
    "януари": "January", "февруари": "February", "март": "March", "април": "April", "май": "May", "юни": "June",
    "юли": "July", "август": "August", "септември": "September", "октомври": "October", "ноември": "November", "декември": "December"
  }));
  const equipment = new Map(Object.entries({
    "360 camera \\ Задна камера": "360° camera / Reversing camera", "4(5) Врати": "4/5 doors", "Бартер": "Part exchange",
    "Лизинг": "Financing", "Напълно обслужен": "Fully serviced", "С регистрация": "Registered", "Нов внос": "Fresh import",
    "Ксенонови фарове": "Xenon headlights", "LED фарове": "LED headlights", "Халогенни фарове": "Halogen headlights",
    "Адаптивни предни светлини": "Adaptive headlights", "Лети джанти": "Alloy wheels", "Металик": "Metallic paint",
    "Панорамен люк": "Panoramic sunroof", "Панорамен покрив": "Panoramic roof", "Шибедах": "Sunroof", "Спойлери": "Spoilers",
    "Камера за заден ход": "Reversing camera", "Задна камера": "Reversing camera",
    "Аларма": "Alarm", "Централно заключване": "Central locking", "Безключово палене": "Keyless start",
    "Кожен салон": "Leather interior", "Велурен салон": "Velour interior", "Bluetooth \\ handsfree система": "Bluetooth / hands-free system",
    "USB, audio\\video, IN\\AUX изводи": "USB, audio/video and AUX inputs", "Бордкомпютър": "On-board computer",
    "Датчик за светлина": "Light sensor", "Ел. Огледала": "Electric mirrors", "Ел. Стъкла": "Electric windows",
    "Ел. регулиране на седалките": "Electric seat adjustment", "Ел. усилвател на волана": "Electric power steering",
    "Серво усилвател на волана": "Power steering", "Климатик": "Air conditioning", "Климатроник": "Automatic climate control",
    "Мултифункционален волан": "Multifunction steering wheel", "Навигация": "Navigation", "Отопление на волана": "Heated steering wheel",
    "Подгряване на предното стъкло": "Heated windscreen", "Подгряване на седалките": "Heated seats",
    "Вентилация на седалките": "Ventilated seats", "Регулиране на волана": "Adjustable steering wheel",
    "Сензор за дъжд": "Rain sensor", "Система за измиване на фаровете": "Headlight washer system",
    "Система за контрол на скоростта (автопилот)": "Cruise control", "Система за контрол на дистанцията": "Distance control system",
    "Система за контрол на спускането": "Hill descent control", "Термопомпа": "Heat pump", "Хладилна жабка": "Cooled glovebox",
    "Автоматично затваряне на багажника": "Power tailgate", "Адаптивно въздушно окачване": "Adaptive air suspension",
    "Антиблокираща система": "Anti-lock braking system (ABS)", "Блокаж на диференциала": "Differential lock",
    "Бързи \\ бавни скорости": "High/low range gearing", "Въздушни възглавници - Задни": "Rear airbags",
    "Въздушни възглавници - Предни": "Front airbags", "Въздушни възглавници - Странични": "Side airbags",
    "Ел. разпределяне на спирачното усилие": "Electronic brake-force distribution",
    "Електронна програма за стабилизиране": "Electronic stability control", "Контрол на налягането на гумите": "Tyre-pressure monitoring",
    "Парктроник": "Parking sensors", "Печка": "Auxiliary heater", "Сервизна книжка": "Service history",
    "Система ISOFIX": "ISOFIX child-seat mounts", "Система за динамична устойчивост": "Dynamic stability control",
    "Система за защита от пробуксуване": "Traction control", "GPS система за проследяване": "GPS tracking system"
  }));
  const descriptionPhrases = new Map([
    ["Автомобилът е в много добро техническо състояние!", "The vehicle is in very good mechanical condition!"],
    ["Автомобилът е в много добро визуално и техническо състояние!", "The vehicle is in very good cosmetic and mechanical condition!"],
    ["Автомобилът е в добро визуално и техническо състояние!", "The vehicle is in good cosmetic and mechanical condition!"],
    ["Бусът е в перфектно визуално и техническо състояние!", "The van is in excellent cosmetic and mechanical condition!"],
    ["Перфектна работа на мотора!", "The engine runs perfectly!"],
    ["Перфектна работа на мотор и скорости!", "The engine and transmission operate perfectly!"],
    ["Предлагаме собствен лизинг на 100% одобрение!", "We offer in-house financing with 100% approval!"],
    ["Предлагаме съдействие в КАТ!", "We provide assistance with Traffic Police registration!"],
    ["Разгледайте и останалите ни обяви!", "Browse our other listings too!"],
    ["Виж всички обяви в fadicars.bazar.bg и fadicars.mobile.bg", "View all listings at fadicars.bazar.bg and fadicars.mobile.bg"],
    ["Виж всички обяви в", "View all listings at"]
  ]);
  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const storageKey = "fadi-language";
  let storedLanguage = "";
  try { storedLanguage = localStorage.getItem(storageKey) || ""; } catch (_) {}
  let language = storedLanguage === "en" ? "en" : "bg";

  function t(value) {
    return language === "en" ? (dictionary.get(value) || value) : value;
  }

  function translateVehicleValue(value) {
    const original = String(value ?? "");
    if (language !== "en" || !original) return original;
    const trimmed = original.trim();
    const exact = vehicleValues.get(trimmed.toLocaleLowerCase("bg-BG"));
    if (exact) return exact;
    const monthMatch = trimmed.match(/^([А-Яа-я]+)(\s+\d{4})$/);
    if (monthMatch && months.has(monthMatch[1].toLocaleLowerCase("bg-BG"))) {
      return `${months.get(monthMatch[1].toLocaleLowerCase("bg-BG"))}${monthMatch[2]}`;
    }
    return trimmed
      .replace(/^Евро\s+/i, "Euro ")
      .replace(/(\d(?:[\d\s.,]*\d)?)\s*км(?=\s|$)/gi, "$1 km")
      .replace(/(\d(?:[\d\s.,]*\d)?)\s*к\.с\.?(?=\s|$)/gi, "$1 hp")
      .replace(/(\d(?:[\d\s.,]*\d)?)\s*см³(?=\s|$)/gi, "$1 cc")
      .replace(/\s{2,}/g, " ");
  }

  function translateVehicleTitle(value) {
    const original = String(value ?? "");
    if (language !== "en" || !original) return original;
    return original
      .replace(/СОБСТВЕН\s+ЛИЗИНГ/gi, "IN-HOUSE FINANCING")
      .replace(/ЛИЗИНГ\s*(?=100%)/gi, "FINANCING ")
      .replace(/ЛИЗИНГ/gi, "FINANCING")
      .replace(/НА\s+100%\s*ОДОБРЕНИЕ/gi, "FINANCING AVAILABLE")
      .replace(/100%\s*ОДОБРЕНИЕУ?/gi, "FINANCING AVAILABLE")
      .replace(/СМЕНЕНА\s+ВЕРИГА/gi, "TIMING CHAIN REPLACED")
      .replace(/ПЪТНА\s+ПОМОЩ/gi, "ROADSIDE ASSISTANCE")
      .replace(/РЪЧНИ\s+СКОРОСТИ/gi, "MANUAL TRANSMISSION")
      .replace(/[МM][-\s]*ПАКЕТ/gi, "M SPORT PACKAGE")
      .replace(/ПРОМОЦИЯ/gi, "PROMOTION")
      .replace(/ГЕРМАНИЯ/gi, "GERMANY")
      .replace(/БЕНЗИН\/МЕТАН/gi, "PETROL/CNG")
      .replace(/ГАЗ\/БЕНЗИН/gi, "LPG/PETROL")
      .replace(/360\s*КАМЕРА/gi, "360° CAMERA")
      .replace(/(^|[\s/*!.])ТОП(?=$|[\s/*!.])/gi, "$1TOP")
      .replace(/(\d+)\s*К\.С\.?/gi, "$1 hp")
      .replace(/(\d+)\s*КМ(?=$|[\s!*/.])/gi, "$1 km")
      .replace(/\s*[!*]+\s*/g, " · ")
      .replace(/\s+/g, " ")
      .replace(/(?:\s*·\s*){2,}/g, " · ")
      .replace(/^\s*·\s*|\s*·\s*$/g, "")
      .trim();
  }

  function translateEquipment(value) {
    const original = String(value ?? "");
    if (language !== "en" || !original) return original;
    return equipment.get(original.trim()) || translateVehicleValue(original);
  }

  function translateVehicleDescription(value) {
    const original = String(value ?? "");
    if (language !== "en" || !original) return original;
    let translated = original;
    descriptionPhrases.forEach((english, bulgarian) => {
      translated = translated.split(bulgarian).join(english);
    });
    return translated;
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

  window.FadiI18n = {
    init,
    apply,
    t,
    translateEquipment,
    translateVehicleDescription,
    translateVehicleTitle,
    translateVehicleValue,
    setLanguage,
    getLanguage: () => language
  };
})();
