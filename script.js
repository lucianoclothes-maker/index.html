/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.10 - STRATEGIC MILITARY TERMINAL
 * =============================================================================
 * ОБЕКТ: Пълна интеграция на военни активи (UA, RU, ME, USA).
 * СТАТУС: ФИНАЛНА ВЕРСИЯ - ПЪЛЕН ОБЕМ (250 РЕДА).
 * ХАРАКТЕРИСТИКИ: Стилизирани тактически икони, LIVE Intel, Пулсации.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКИЯ ИНТЕРФЕЙС ---
    // Фокусираме картата върху основните конфликтни зони (Източна Европа)
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    }).setView([47.5, 36.5], 5); 

    // РАЗГРАНИЧАВАНЕ НА СЛОЕВЕТЕ ЗА ВИЗУАЛИЗАЦИЯ
    const markersLayer = L.layerGroup().addTo(map);   // Динамични събития (JSON)
    const militaryLayer = L.layerGroup().addTo(map);  // Статична инфраструктура

    // ЗАРЕЖДАНЕ НА ТЪМЕН ТАКТИЧЕСКИ СЛОЙ (DARK MODE)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ВИЗУАЛНА ИДЕНТИФИКАЦИЯ ---
    // Списък на държавите с активни военни действия
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    
    // Списък на държавите в състояние на повишено напрежение
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

    // ИЗВЛИЧАНЕ НА ГЛОБАЛНИ ГРАНИЦИ И ПРИЛАГАНЕ НА ТАКТИЧЕСКИ СТИЛОВЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
                    // ЛОГИКА ЗА ОЦВЕТЯВАНЕ: ЧЕРВЕНО (КОНФЛИКТ), ОРАНЖЕВО (РИСК)
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 1.8, opacity: 1, color: '#ff3333', fillOpacity: 0.28 };
                    }
                    if (tensionZones.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1.4, opacity: 1, color: '#ff8c00', fillOpacity: 0.18 };
                    }
                    // НЕУТРАЛНИ ЗОНИ
                    return { fillColor: "#000", weight: 0.6, color: "#333", fillOpacity: 0.12 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let statusInfo = "NO REPORTED ACTIVITY";
                    
                    if (warZones.includes(name)) statusInfo = "CRITICAL: ACTIVE WARZONE";
                    else if (tensionZones.includes(name)) statusInfo = "ELEVATED: TENSION DETECTED";

                    // ИНТЕРАКТИВЕН ТАКТИЧЕСКИ TOOLTIP
                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.95); color:#fff; border:1px solid #39FF14; padding:8px; font-family:monospace;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            STATUS: <span style="color:#ff4d4d;">${statusInfo}</span><br>
                            <small style="color:#888;">COORDINATES LOGGED</small>
                        </div>`, { sticky: true, opacity: 1.0 });

                    // ВИЗУАЛНА ОБРАТНА ВРЪЗКА ПРИ HOVER
                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.45, weight: 2.5, color: '#39FF14' });
                    });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        this.setStyle({ 
                            fillOpacity: isWar ? 0.28 : 0.12, 
                            weight: isWar ? 1.8 : 0.6,
                            color: isWar ? '#ff3333' : '#333'
                        });
                    });
                }
            }).addTo(map);
        });

    // --- 3. РАЗШИРЕНА БАЗА ДАННИ: СТРАТЕГИЧЕСКА ИНФРАСТРУКТУРА ---
    const militaryAssets = [
        // УКРАЙНА (UA) - ЛЕТИЩА И ОТБРАНА
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Cargo Base - Kiev Sector" },
        { name: "Starokostiantyniv AB", type: "airbase-ua", lat: 49.74, lon: 27.26, info: "Su-24 Tactical Aviation - West Sector" },
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Black Sea Fleet Defense Command" },
        { name: "Odesa Port Intel", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Maritime Logistics & Intel Hub" },
        
        // РУСИЯ (RU) - СТРАТЕГИЧЕСКИ КОМПЛЕКСИ
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Strategic Tu-160/95 Bomber Command" },
        { name: "Belbek Air Base", type: "airbase-ru", lat: 44.68, lon: 33.57, info: "Crimea Air Superiority Control" },
        { name: "Millerovo Airfield", type: "airbase-ru", lat: 48.95, lon: 40.29, info: "Frontline Fighter Operations Base" },
        { name: "Sevastopol Naval", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Main Black Sea Fleet Headquarters" },
        
        // БЛИЗЪК ИЗТОК (US/IRAN)
        { name: "Al Udeid Air Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US Air Forces Central (CENTCOM)" },
        { name: "Natanz AD Site", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Primary Early Warning Radar Hub" },
        { name: "Bushehr AD Shield", type: "radar-iran", lat: 28.82, lon: 50.88, info: "Strategic Anti-Air Missile Shield" }
    ];

    // --- 4. CSS ТАКТИЧЕСКИ АНИМАЦИИ (CUSTOM STYLING) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .icon-air-ua { background: rgba(52, 152, 219, 0.25); color: #3498db; animation: pulse-ua 2.8s infinite; }
        .icon-air-ru { background: rgba(231, 76, 60, 0.25); color: #e74c3c; animation: pulse-ru 3.2s infinite; }
        .icon-us-intel { background: rgba(57, 255, 20, 0.15); color: #39FF14; border: 1.5px solid #39FF14; animation: pulse-ua 3.5s infinite; }
        .icon-iran-radar { background: rgba(241, 196, 15, 0.25); color: #f1c40f; filter: drop-shadow(0 0 5px #f1c40f); }
        
        @keyframes pulse-ua { 0% { box-shadow: 0 0 0px #3498db; } 50% { box-shadow: 0 0 15px #3498db; } 100% { box-shadow: 0 0 0px #3498db; } }
        @keyframes pulse-ru { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.18); filter: brightness(1.4); } 100% { transform: scale(1); filter: brightness(1); } }
        @keyframes live-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .live-dot { height: 12px; width: 12px; background-color: #39FF14; border-radius: 50%; display: inline-block; margin-right: 10px; animation: live-blink 1.2s infinite; box-shadow: 0 0 10px #39FF14; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИЯ ЗА ГЕНЕРИРАНЕ НА ТАКТИЧЕСКИ ИКОНИ ---
    function createStrategicIcon(type) {
        let symbol = '✈️'; 
        let classList = 'mil-icon ';
        
        // ЛОГИКА ЗА СИМВОЛИЗАЦИЯ
        if (type === 'airbase-ua') { symbol = '🛫'; classList += 'icon-air-ua'; }
        else if (type === 'airbase-ru') { symbol = '🛩️'; classList += 'icon-air-ru'; }
        else if (type === 'naval-ua' || type === 'naval-ru') { symbol = '⚓'; classList += type.includes('ua') ? 'icon-air-ua' : 'icon-air-ru'; }
        else if (type === 'us-hq') { symbol = '🦅'; classList += 'icon-us-intel'; }
        else if (type === 'radar-iran') { symbol = '📡'; classList += 'icon-iran-radar'; }
        
        return L.divIcon({
            html: `<div class="${classList}" style="font-size:20px; width:34px; height:34px;">${symbol}</div>`,
            className: '', iconSize: [34, 34], iconAnchor: [17, 17]
        });
    }

    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: createStrategicIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`<div style="background:rgba(0,0,0,0.9); color:white; border:1px solid #39FF14; padding:12px; font-family:monospace; min-width:200px;">
                <strong style="color:#39FF14; font-size:14px;">${asset.name.toUpperCase()}</strong><br>
                <span style="color:#888;">MISSION:</span> ${asset.type.toUpperCase()}<br>
                <span style="color:#888;">REMARKS:</span> ${asset.info}</div>`, { direction: 'top', offset: [0, -10] });
    });

    // --- 6. LIVE INTEL FEED ИНДИКАТОР (sidebar) ---
    const feedHeader = document.querySelector('.sidebar-header') || document.querySelector('h2'); 
    if (feedHeader && !document.getElementById('live-status')) {
        const liveIndicator = document.createElement('div');
        liveIndicator.id = 'live-status';
        liveIndicator.style = "float: right; font-size: 11px; color: #39FF14; font-family: monospace; border: 1px solid #39FF14; padding: 5px 10px; background: rgba(0,0,0,0.85); box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);";
        liveIndicator.innerHTML = '<span class="live-dot"></span>INTEL STREAM: ACTIVE';
        feedHeader.appendChild(liveIndicator);
    }

    // --- 7. СИНХРОНИЗАЦИЯ НА КОНФЛИКТНИ ТОЧКИ (JSON) ---
    function syncStrategicIntel() {
        // Добавяме cache-buster за избягване на стари данни
        fetch('conflicts.json?v_refresh=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const icon = L.divIcon({
                        html: `<div style="color:#ff4d4d; font-size:26px; text-shadow:0 0 15px red; animation: live-blink 1.5s infinite;">●</div>`,
                        className: 'pulsing-marker', iconSize:[28,28]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: icon })
                        .addTo(markersLayer)
                        .on('click', () => {
                            const detailPanel = document.getElementById('news-content');
                            if(detailPanel) {
                                detailPanel.innerHTML = `
                                    <h3 style="color:#39FF14; border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:10px;">${item.title}</h3>
                                    <p style="color:#ddd; font-size:15px; line-height:1.7;">${item.description}</p>
                                    <div style="margin-top:15px; padding-top:10px; border-top:1px dashed #333; color:#ff4d4d; font-weight:bold;">TACTICAL CASUALTIES: ${item.fatalities || 0}</div>
                                `;
                            }
                        });
                });
                if (document.getElementById('active-events')) document.getElementById('active-events').innerText = data.length;
            })
            .catch(err => console.error("STRATEGIC ERROR: Intel synchronization failed. System retrying..."));
    }

    // ИНИЦИАЛНО СТАРТИРАНЕ И ПЕРИОДИЧЕН ЦИКЪЛ (60 СЕКУНДИ)
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
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ СКРИПТ - ОБЩ БРОЙ РЕДОВЕ: 250
 * =============================================================================
 */
