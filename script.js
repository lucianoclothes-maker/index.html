window.onload = function() {
    // 1. ИНИЦИАЛИЗАЦИЯ
    var map = L.map('map', { 
        worldCopyJump: true, 
        minZoom: 2 
    }).setView([48.0, 37.0], 5);

    var markersLayer = L.layerGroup().addTo(map);

    // Базов слой - Тъмен
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png').addTo(map);

    // 2. ЧЕРВЕНА ЗОНА (УКРАЙНА) - ПОДРЕДЕНА ПРАВИЛНО
    var ukraineZone = [
        [51.5, 34.0], [50.1, 38.5], [48.5, 39.5], [47.1, 38.2], 
        [45.3, 36.6], [44.3, 33.5], [45.2, 33.0], [46.3, 32.2], 
        [48.5, 36.0], [51.5, 34.0]
    ];

    L.polygon(ukraineZone, {
        color: '#ff3333',
        weight: 1,
        fillColor: '#ff0000',
        fillOpacity: 0.15,
        interactive: false
    }).addTo(map);

    // Имената на държавите отгоре
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { opacity: 0.5, pane: 'shadowPane' }).addTo(map);

    // 3. ФУНКЦИЯ ЗА СЪЗДАВАНЕ НА ИКОНИ (С ПОПРАВКА)
    function makeIcon(symbol, color, pulse = false) {
        return L.divIcon({
            html: `<div style="color: ${color}; font-size: 22px; text-shadow: 0 0 10px ${color}; ${pulse ? 'animation: pulse 1.5s infinite;' : ''}">${symbol}</div>`,
            className: '', iconSize: [30, 30], iconAnchor: [15, 15]
        });
    }

    const iconSet = {
        missile: makeIcon('🚀', '#a366ff'),
        ship:    makeIcon('🚢', '#3498db'),
        aid:     makeIcon('📦', '#2ecc71'),
        warn:    makeIcon('⚠️', '#ffcc00'),
        clash:   makeIcon('⚔️', '#ff4d4d', true),
        dot:     makeIcon('●', '#ff4d4d', true)
    };

    function getIcon(title, desc) {
        const text = (title + " " + (desc || "")).toLowerCase();
        if (text.includes('missile') || text.includes('strike') || text.includes('drone')) return iconSet.missile;
        if (text.includes('ship') || text.includes('sea') || text.includes('navy')) return iconSet.ship;
        if (text.includes('aid') || text.includes('food') || text.includes('hunger')) return iconSet.aid;
        if (text.includes('war') || text.includes('battle') || text.includes('village')) return iconSet.clash;
        if (text.includes('warning') || text.includes('threat')) return iconSet.warn;
        return iconSet.dot;
    }

    // 4. ЗАРЕЖДАНЕ НА ДАННИ
    function loadData() {
        fetch('conflicts.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                let deaths = 0;
                let countries = new Set();
                let tickerArr = [];

                data.forEach(p => {
                    // Статистика
                    let pFatalities = parseInt(p.fatalities) || 0;
                    deaths += pFatalities;
                    if (p.country) countries.add(p.country);
                    
                    tickerArr.push(`[${p.country.toUpperCase()}]: ${p.title}`);

                    // Маркер
                    L.marker([p.lat, p.lon], { icon: getIcon(p.title, p.description) })
                        .addTo(markersLayer)
                        .on('click', () => {
                            document.getElementById('news-content').innerHTML = `
                                <div class="news-card">
                                    <h3>${p.title}</h3>
                                    <p>${p.description || "Няма описание."}</p>
                                    <div class="meta">Жертви: ${p.fatalities || 0}</div>
                                    <a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a>
                                </div>`;
                        });
                });

                // Обновяване на UI
                document.getElementById('active-events').innerText = "Active events: " + data.length;
                document.getElementById('total-fatalities').innerText = "Total fatalities: " + deaths;
                document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
                document.getElementById('last-update').innerText = new Date().toLocaleTimeString();
                
                const ticker = document.getElementById('news-ticker');
                if (ticker) ticker.innerText = tickerArr.join('   •   ');
            })
            .catch(err => console.error("Грешка:", err));
    }

    loadData();
    setInterval(loadData, 60000);
};

// ЧАСОВНИК
setInterval(() => {
    const clock = document.getElementById('utc-clock');
    if (clock) clock.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
