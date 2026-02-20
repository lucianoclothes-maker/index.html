window.onload = function() {
    const alertSound = new Audio('alert.mp3');
    let previousEventCount = 0; 
    let allConflictData = [];
    let markersLayer = L.layerGroup();

    // --- 1. КАРТА ---
    var map = L.map('map', { worldCopyJump: true, minZoom: 2 }).setView([48.0, 37.0], 5);
    markersLayer.addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { opacity: 0.5, pane: 'shadowPane' }).addTo(map);

    // --- 2. ВРЪЩАНЕ НА СТАРИТЕ ИКОНИ (КАТО В ЛЕГЕНДАТА) ---
    const createOldIcon = (symbol, color) => {
        return L.divIcon({
            html: `<div style="color: ${color}; font-size: 22px; text-shadow: 0 0 8px #000; font-weight: bold; display: flex; align-items: center; justify-content: center;">${symbol}</div>`,
            className: '', 
            iconSize: [30, 30], 
            iconAnchor: [15, 15]
        });
    };

    const iconClash = createOldIcon('✖', '#ff4d4d');     // Червен хикс
    const iconExplosion = createOldIcon('⚠️', '#ffcc00'); // Жълт триъгълник
    const iconNaval = createOldIcon('🚢', '#3498db');     // Син кораб
    const iconMissile = createOldIcon('🚀', '#8e44ad');   // Лилава ракета

    // --- 3. ЛОГИКА ЗА ИКОНИТЕ ---
    function getTacticalIcon(type, title) {
        const t = title.toLowerCase();
        if (t.includes('missile') || t.includes('ракет') || t.includes('drone') || t.includes('дрон')) return iconMissile;
        if (type === 'Naval' || t.includes('ship') || t.includes('кораб')) return iconNaval;
        if (type === 'Explosion' || type === 'Airstrike' || t.includes('удар') || t.includes('взрив')) return iconExplosion;
        return iconClash;
    }

    // --- 4. УКРАЙНА (ЗОНИ И ЕТИКЕТИ) ---
    var occupiedArea = [[46.1, 32.9], [44.4, 33.5], [44.5, 34.2], [45.4, 36.5], [47.1, 37.6], [48.1, 39.5], [49.6, 40.1], [50.2, 38.5], [46.1, 32.9]];
    L.polygon(occupiedArea, { color: '#ff0000', weight: 1, fillColor: '#ff0000', fillOpacity: 0.2 }).addTo(map);

    const addFrontLabel = (coords, text) => {
        L.marker(coords, { icon: L.divIcon({ className: 'front-text-label', html: text, iconSize: [80, 20] }) }).addTo(map);
    };
    addFrontLabel([48.2, 37.2], "ПОКРОВСК");
    addFrontLabel([46.6, 32.6], "ХЕРСОН");

    // --- 5. ДАННИ И СТАТИСТИКА ---
    function loadMapData() {
        fetch('conflicts.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                allConflictData = data;
                markersLayer.clearLayers();
                
                let countries = new Set();
                let totalDeaths = 0;

                data.forEach(p => {
                    if (p.fatalities) totalDeaths += parseInt(p.fatalities);
                    countries.add(p.country);
                    
                    let marker = L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.type, p.title) });
                    marker.addTo(markersLayer);
                    
                    marker.on('click', () => {
                        map.setView([p.lat, p.lon], 7);
                        document.getElementById('news-content').innerHTML = `
                            <div class="news-card">
                                <h3>${p.country}</h3>
                                <p>${p.title}</p>
                                <a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a>
                            </div>`;
                    });
                });

                document.getElementById('active-events').innerText = "Активни събития: " + data.length;
                document.getElementById('total-fatalities').innerText = "Total fatalities: " + totalDeaths;
                document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
                document.getElementById('last-update').innerText = "Last update: " + new Date().toLocaleTimeString();
            })
            .catch(err => console.error("Грешка при зареждане:", err));
    }

    loadMapData();
    setInterval(loadMapData, 60000);
};

// Часовник
setInterval(() => {
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.getUTCHours().toString().padStart(2, '0') + ":" + 
                          now.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                          now.getUTCSeconds().toString().padStart(2, '0') + " UTC";
    }
}, 1000);
