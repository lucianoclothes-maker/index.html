/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.14 - STRATEGIC COMMAND UNIT
 * =============================================================================
 * ОБЕКТ: Възстановяване на пълна функционалност: Котви, Самолети, Радари.
 * СТАТУС: ПЪЛЕН ОБЕМ (255 РЕДА) - НЕ СЪКРАЩАВАЙ!
 * ПОСЛЕДНА КОРЕКЦИЯ: Фикс на "Read More" линкове и икони за флот.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ОСНОВНА ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКИЯ ИНТЕРФЕЙС ---
    // Настройваме координатите за фокус върху основните конфликтни зони
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    }).setView([46.0, 38.0], 5); 

    // ДЕФИНИРАНЕ НА СЛОЕВЕТЕ ЗА ИНТЕЛИГЕНТНО ВИЗУАЛИЗИРАНЕ
    // Слой за новинарски събития от JSON файла
    const markersLayer = L.layerGroup().addTo(map);   
    
    // Слой за постоянна военна инфраструктура (бази, ПВО, пристанища)
    const militaryLayer = L.layerGroup().addTo(map);  

    // ЗАРЕЖДАНЕ НА ТЪМЕН ТАКТИЧЕСКИ СЛОЙ (NIGHT RADAR STYLE)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ВИЗУАЛНО ИДЕНТИФИЦИРАНЕ ---
    // Държави с активни конфликти (Цвят: Наситено червено)
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    
    // Държави под повишено напрежение (Цвят: Оранжев риск)
    const tensionZones = [
        'United States', 
        'United States of America', 
        'USA', 
        'Iran', 
        'North Korea', 
        'South Korea', 
        'China', 
        'Taiwan'
    ];

    // ИЗВЛИЧАНЕ НА СВЕТОВНИ ГРАНИЦИ И ПРИЛАГАНЕ НА ТАКТИЧЕСКИ СТИЛОВЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
                    // ЛОГИКА ЗА ОЦВЕТЯВАНЕ СПРЯМО СТАТУСА НА ДЪРЖАВАТА
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 1.8, opacity: 1, color: '#ff3333', fillOpacity: 0.28 };
                    }
                    if (tensionZones.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1.4, opacity: 1, color: '#ff8c00', fillOpacity: 0.18 };
                    }
                    return { fillColor: "#000", weight: 0.6, color: "#333", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    
                    // ДОБАВЯНЕ НА ИНТЕРАКТИВЕН ТАКТИЧЕСКИ TOOLTIP
                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.95); color:#fff; border:1px solid #39FF14; padding:8px; font-family:monospace;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            STATUS: <span style="color:#ff4d4d;">MONITORED REGION</span>
                        </div>`, { sticky: true, opacity: 1.0 });

                    // ЕФЕКТИ ПРИ ПОСОЧВАНЕ С МИШКАТА (HOVER)
                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.45, weight: 2.5, color: '#39FF14' });
                    });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        this.setStyle({ 
                            fillOpacity: isWar ? 0.28 : 0.1, 
                            weight: isWar ? 1.8 : 0.6,
                            color: isWar ? '#ff3333' : '#333'
                        });
                    });
                }
            }).addTo(map);
        });

    // --- 3. БАЗА ДАННИ: СТРАТЕГИЧЕСКИ ВОЕННИ ОБЕКТИ (UA, RU, US, IRAN) ---
    const militaryAssets = [
        // УКРАЙНА (UA) - ВЪЗСТАНОВЕНИ МОРСКИ И ВЪЗДУШНИ ЦЕНТРОВЕ
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Cargo Base" },
        { name: "Starokostiantyniv AB", type: "airbase-ua", lat: 49.74, lon: 27.26, info: "Tactical Aviation Hub" },
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense Command" },
        { name: "Odesa Port Intel", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Maritime Logistics Center" },
        
        // РУСИЯ (RU) - СТРАТЕГИЧЕСКА ИНФРАСТРУКТУРА
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Tu-160 Bomber Operations" },
        { name: "Belbek Air Base", type: "airbase-ru", lat: 44.68, lon: 33.57, info: "Crimea Air Superiority" },
        { name: "Sevastopol Naval", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet HQ" },
        { name: "Millerovo Airfield", type: "airbase-ru", lat: 48.95, lon: 40.29, info: "Fighter Strike Base" },
        
        // БЛИЗЪК ИЗТОК & US ASSETS
        { name: "Al Udeid Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM HQ Center" },
        { name: "Natanz AD Complex", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Strategic Early Warning" },
        { name: "Bushehr AD Shield", type: "radar-iran", lat: 28.82, lon: 50.88, info: "Nuclear Site Air Defense" }
    ];

    // --- 4. CSS ТАКТИЧЕСКИ АНИМАЦИИ (ВЪЗСТАНОВЕНИ СТИЛОВЕ) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); }
        .icon-ua { background: rgba(52, 152, 219, 0.25); color: #3498db; animation: pulse-ua 2.5s infinite; }
        .icon-ru { background: rgba(231, 76, 60, 0.25); color: #e74c3c; animation: pulse-ru 3s infinite; }
        .icon-us { background: rgba(57, 255, 20, 0.15); color: #39FF14; border: 1.5px solid #39FF14; }
        .icon-iran { background: rgba(241, 196, 15, 0.25); color: #f1c40f; }
        .read-full-btn { display: block; width: fit-content; margin-top: 15px; padding: 12px 22px; background: #39FF14; color: #000 !important; text-decoration: none !important; font-weight: bold; font-family: monospace; border-radius: 4px; text-transform: uppercase; cursor: pointer; transition: 0.3s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .read-full-btn:hover { background: #fff; box-shadow: 0 0 20px #39FF14; transform: scale(1.05); }
        @keyframes pulse-ua { 0% { box-shadow: 0 0 0px #3498db; } 50% { box-shadow: 0 0 15px #3498db; } 100% { box-shadow: 0 0 0px #3498db; } }
        @keyframes pulse-ru { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .live-dot { height: 10px; width: 10px; background-color: #39FF14; border-radius: 50%; display: inline-block; margin-right: 10px; animation: pulse-ua 1s infinite; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИЯ ЗА СТРАТЕГИЧЕСКИ ИКОНИ (СЪС СИМВОЛИ ЗА ФЛОТ) ---
    function getStrategicIcon(type) {
        let sym = '✈️'; 
        let cls = 'mil-icon ';
        
        // ВРЪЩАНЕ НА КОТВИТЕ ЗА МОРСКИ БАЗИ (ФИКС)
        if (type.includes('airbase-ua')) { sym = '🛫'; cls += 'icon-ua'; }
        else if (type.includes('airbase-ru')) { sym = '🛩️'; cls += 'icon-ru'; }
        else if (type.includes('naval')) { sym = '⚓'; cls += type.includes('ua') ? 'icon-ua' : 'icon-ru'; }
        else if (type === 'us-hq') { sym = '🦅'; cls += 'icon-us'; }
        else if (type === 'radar-iran') { sym = '📡'; cls += 'icon-iran'; }
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:20px; width:34px; height:34px;">${sym}</div>`,
            className: '', iconSize: [34, 34], iconAnchor: [17, 17]
        });
    }

    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: getStrategicIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                <strong style="color:#39FF14;">${asset.name.toUpperCase()}</strong><br>
                INTEL: ${asset.info}</div>`, { direction: 'top' });
    });

    // --- 6. LIVE FEED ИНДИКАТОР В СТРАНИЧНИЯ ПАНЕЛ ---
    const feedHeader = document.querySelector('.sidebar-header') || document.querySelector('h2'); 
    if (feedHeader && !document.getElementById('live-status')) {
        const liveIndicator = document.createElement('div');
        liveIndicator.id = 'live-status';
        liveIndicator.style = "float: right; font-size: 11px; color: #39FF14; font-family: monospace; border: 1px solid #39FF14; padding: 5px 10px; background: rgba(0,0,0,0.85);";
        liveIndicator.innerHTML = '<span class="live-dot"></span>INTEL STREAM: ACTIVE';
        feedHeader.appendChild(liveIndicator);
    }

    // --- 7. СИНХРОНИЗАЦИЯ НА JSON ДАННИ И ФИКС НА ЛИНКОВЕ ---
    function syncStrategicIntel() {
        // Добавяме параметър за избягване на кеширането
        fetch('conflicts.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const icon = L.divIcon({
                        html: `<div style="color:#ff4d4d; font-size:24px; text-shadow:0 0 15px red;">●</div>`,
                        className: 'pulsing-marker', iconSize:[26,26]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: icon })
                        .addTo(markersLayer)
                        .on('click', () => {
                            const detailPanel = document.getElementById('news-content');
                            if(detailPanel) {
                                // ФИКС: target="_blank" ГАРАНТИРА ОТВАРЯНЕ В НОВ ПРОЗОРЕЦ БЕЗ РЕФРЕШ
                                const reportUrl = item.url || "#";
                                detailPanel.innerHTML = `
                                    <h3 style="color:#39FF14; border-bottom:1px solid #333; padding-bottom:12px; margin-bottom:12px;">${item.title}</h3>
                                    <p style="color:#ddd; font-size:15px; line-height:1.7;">${item.description}</p>
                                    <div style="margin: 15px 0; color:#ff4d4d; font-weight:bold;">TACTICAL CASUALTIES: ${item.fatalities || 0}</div>
                                    <a href="${reportUrl}" target="_blank" rel="noopener noreferrer" class="read-full-btn">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
                // Актуализация на броя активни събития
                const countEl = document.getElementById('active-events');
                if (countEl) countEl.innerText = data.length;
            }).catch(err => console.error("STRATEGIC ERROR: Intel synchronization failed."));
    }

    // ИНИЦИАЛНО СТАРТИРАНЕ И ЗАДАВАНЕ НА ЦИКЪЛ (60 СЕКУНДИ)
    syncStrategicIntel();
    setInterval(syncStrategicIntel, 60000);
};

// --- 8. ГЛОБАЛЕН UTC ТАКТИЧЕСКИ ЧАСОВНИК ---
setInterval(() => {
    const clockElement = document.getElementById('header-time');
    if (clockElement) {
        const d = new Date();
        const h = d.getUTCHours().toString().padStart(2, '0');
        const m = d.getUTCMinutes().toString().padStart(2, '0');
        const s = d.getUTCSeconds().toString().padStart(2, '0');
        clockElement.innerText = "TIME: " + h + ":" + m + ":" + s + " UTC";
    }
}, 1000);

/**
 * =============================================================================
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ СКРИПТ - ОБЩ БРОЙ РЕДОВЕ: 255
 * =============================================================================
 */
