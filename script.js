/**
 * GLOBAL CONFLICT DASHBOARD - CORE ENGINE v2.0
 * Всичко в едно: Карта, Фронт, Статистика, Тикер и Икони.
 */

window.onload = function() {
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', { 
        worldCopyJump: true, 
        minZoom: 2,
        maxBounds: [[-85, -180], [85, 180]]
    }).setView([48.0, 37.0], 5);

    // Слоеве за иконите (трябва да са най-отгоре)
    const markersLayer = L.layerGroup().addTo(map);

    // Базова тъмна карта (CartoDB Dark)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB'
    }).addTo(map);

    // --- 2. ЧЕРВЕНА ЗОНА (УКРАЙНА - БЕЗ ЗИГ-ЗАГ) ---
    // Точките са подредени по часовниковата стрелка за перфектен полигон
    const ukraineFrontline = [
        [50.2, 36.2], [50.1, 38.5], [49.2, 39.8], // Северен фронт
        [48.5, 39.5], [47.8, 38.8], [47.1, 38.2], // Донбас
        [46.8, 37.5], [46.3, 36.5], [45.8, 35.0], // Азовско море
        [45.3, 36.6], [45.0, 35.5], [44.4, 34.1], // Крим (Изток)
        [44.3, 33.5], [45.2, 33.0], [46.0, 32.2], // Крим (Запад) / Херсон
        [46.5, 32.5], [47.2, 34.5], [47.5, 36.5], // Поречието на Днепър
        [50.2, 36.2] // Затваряне
    ];

    L.polygon(ukraineFrontline, {
        color: '#ff3333',
        weight: 2,
        fillColor: '#ff0000',
        fillOpacity: 0.18,
        dashArray: '7, 10', // Военен пунктир
        interactive: false   // За да не пречи на кликането по иконите
    }).addTo(map);

    // Слой с имената на държавите (над червената зона)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { 
        opacity: 0.5, 
        pane: 'shadowPane' 
    }).addTo(map);

    // --- 3. СИСТЕМА ЗА ТАКТИЧЕСКИ ИКОНИ ---
    const createNeonIcon = (symbol, color, isPulsing = false) => L.divIcon({
        html: `<div style="
            color: ${color}; 
            font-size: 22px; 
            text-shadow: 0 0 12px ${color}, 0 0 5px #000; 
            font-weight: bold; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            ${isPulsing ? 'animation: pulse 1.5s infinite;' : ''}">
            ${symbol}
        </div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    });

    const tacticalIcons = {
        clash:   createNeonIcon('●', '#ff4d4d', true),  // Пулсираща точка за бой
        missile: createNeonIcon('🚀', '#a366ff'),      // Лилаво за ракети
        ship:    createNeonIcon('🚢', '#3498db'),      // Синьо за флот
        warning: createNeonIcon('⚠️', '#ffcc00'),      // Жълто за напрежение
        nuke:    createNeonIcon('☢️', '#2ecc71')       // Зелено за ядрена заплаха
    };

    function getIconByType(title, description = "") {
        const text = (title + " " + description).toLowerCase();
        if (text.includes('missile') || text.includes('strike') || text.includes('explosion')) return tacticalIcons.missile;
        if (text.includes('ship') || text.includes('sea') || text.includes('navy')) return tacticalIcons.ship;
        if (text.includes('nuclear') || text.includes('radiation')) return tacticalIcons.nuke;
        if (text.includes('warning') || text.includes('threat')) return tacticalIcons.warning;
        return tacticalIcons.clash; // По подразбиране
    }

    // --- 4. ЛОГИКА ЗА ДАННИ И СТАТИСТИКА ---
    function updateDashboard() {
        console.log("Опресняване на данните...");
        
        fetch('conflicts.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                // Изчистваме старите маркери
                markersLayer.clearLayers();
                
                let deaths = 0;
                let countryList = new Set();
                let tickerItems = [];

                data.forEach(event => {
                    // Пресмятане на статистика
                    if (event.fatalities) deaths += parseInt(event.fatalities);
                    if (event.country) countryList.add(event.country);
                    
                    // Подготовка на тикера
                    tickerItems.push(`[${event.country.toUpperCase()}]: ${event.title}`);

                    // Добавяне на маркер
                    const icon = getIconByType(event.title, event.description);
                    const marker = L.marker([event.lat, event.lon], { icon: icon });
                    
                    marker.addTo(markersLayer).on('click', () => {
                        const content = document.getElementById('news-content');
                        if (content) {
                            content.innerHTML = `
                                <div class="news-card animated-in">
                                    <span class="tag">${event.country}</span>
                                    <h3>${event.title}</h3>
                                    <p>${event.description || "Няма допълнително описание за това събитие."}</p>
                                    <div class="meta">Жертви: ${event.fatalities || 0}</div>
                                    <a href="${event.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД →</a>
                                </div>`;
                        }
                    });
                });

                // Обновяване на UI елементите (Статистика)
                safeUpdateDOM('active-events', data.length);
                safeUpdateDOM('total-fatalities', deaths);
                safeUpdateDOM('countries-affected', countryList.size);
                safeUpdateDOM('last-update', new Date().toLocaleTimeString());

                // Обновяване на Тикера (Зеления текст)
                const tickerEl = document.getElementById('news-ticker');
                if (tickerEl) tickerEl.innerText = tickerItems.join('   •   ');
            })
            .catch(err => {
                console.error("Грешка при зареждане на JSON:", err);
                safeUpdateDOM('last-update', "ГРЕШКА В JSON");
            });
    }

    // Помощна функция за безопасно писане в HTML
    function safeUpdateDOM(id, value) {
        const el = document.getElementById(id);
        if (el) {
            // Ако е брояч, добавяме малко текст за яснота
            if (id === 'active-events') el.innerText = "Active events: " + value;
            else if (id === 'total-fatalities') el.innerText = "Total fatalities: " + value;
            else if (id === 'countries-affected') el.innerText = "Countries affected: " + value;
            else el.innerText = value;
        }
    }

    // Първоначално стартиране
    updateDashboard();
    setInterval(updateDashboard, 60000); // Рефреш на 1 минута
};

// --- 5. UTC ЧАСОВНИК ---
setInterval(() => {
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) {
        const now = new Date();
        const time = now.toUTCString().split(' ')[4];
        clockEl.innerText = time + " UTC";
    }
}, 1000);
