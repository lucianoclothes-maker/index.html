window.onload = function() {
    let markersLayer = L.layerGroup();

    // 1. КАРТА
    var map = L.map('map', { worldCopyJump: true, minZoom: 2 }).setView([48.0, 37.0], 5);
    markersLayer.addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png').addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { opacity: 0.5, pane: 'shadowPane' }).addTo(map);

    // --- РЪЧНИ КООРДИНАТИ (СВЕРЕНИ С LIVEUAMAP) ---
    var frontlinePoints = [
        [50.2, 38.3], [49.5, 38.0], [49.0, 38.2], [48.5, 38.0], // Луганска област
        [48.6, 37.8], [48.3, 38.0], [48.0, 37.6], [47.8, 37.5], // Бахмут / Авдеевка
        [47.5, 37.0], [47.4, 36.5], [47.3, 35.5], [47.5, 35.0], // Запорожие
        [46.8, 34.0], [46.5, 33.0], [46.3, 32.5],               // Херсон / Днепър
        [46.0, 32.2], [45.5, 32.5], [44.4, 33.5], [44.5, 34.5], // Кримски бряг
        [45.3, 36.5], [46.5, 37.0], [47.1, 37.6], [50.2, 38.3]  // Обратно горе
    ];

    L.polygon(frontlinePoints, {
        color: '#ff3333',
        weight: 2,
        fillColor: '#ff0000',
        fillOpacity: 0.2,
        dashArray: '5, 5' // Прави линията да изглежда тактическа (на точки)
    }).addTo(map);

    // 2. ИКОНИ И СТИЛОВЕ
    const createNeonIcon = (symbol, color, isPulsing = false) => L.divIcon({
        html: `<div style="color: ${color}; font-size: 22px; text-shadow: 0 0 10px ${color}; font-weight: bold; display: flex; align-items: center; justify-content: center; ${isPulsing ? 'animation: pulse 1.5s infinite;' : ''}">${symbol}</div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 15]
    });

    const icons = {
        clash: createNeonIcon('●', '#ff4d4d', true),
        warning: createNeonIcon('⚠️', '#ffcc00'),
        ship: createNeonIcon('🚢', '#3498db'),
        missile: createNeonIcon('🚀', '#8e44ad')
    };

    function getTacticalIcon(title) {
        const t = title.toLowerCase();
        if (t.includes('missile') || t.includes('drone')) return icons.missile;
        if (t.includes('ship') || t.includes('sea')) return icons.ship;
        if (t.includes('war') || t.includes('killing')) return icons.warning;
        return icons.clash;
    }

    // 3. ЗАРЕЖДАНЕ НА ДАННИ
    function loadMapData() {
        fetch('conflicts.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                let countries = new Set(), totalDeaths = 0;
                const tickerEl = document.getElementById('news-ticker');
                if (tickerEl) tickerEl.innerText = data.map(p => `[${p.country.toUpperCase()}]: ${p.title}`).join('  •  ');

                data.forEach(p => {
                    if (p.fatalities) totalDeaths += parseInt(p.fatalities);
                    countries.add(p.country);
                    L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.title) }).addTo(markersLayer).on('click', () => {
                        document.getElementById('news-content').innerHTML = `
                            <div class="news-card"><h3>${p.country}</h3><p>${p.title}</p>
                            <a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a></div>`;
                    });
                });

                document.getElementById('active-events').innerText = "Active events: " + data.length;
                document.getElementById('total-fatalities').innerText = "Total fatalities: " + totalDeaths;
                document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
                document.getElementById('last-update').innerText = "Last update: " + new Date().toLocaleTimeString();
            }).catch(e => console.log("Зареди conflicts.json!"));
    }

    loadMapData();
    setInterval(loadMapData, 60000);
};

// 4. ЧАСОВНИК
setInterval(() => {
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) clockEl.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
