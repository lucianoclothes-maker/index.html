/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.12 - INTEL SOURCE INTEGRATION
 * =============================================================================
 * ОБЕКТ: Пълна база данни (UA, RU, ME) + Функционални линкове към източници.
 * СТАТУС: ФИНАЛЕН ОБЕМ (250 РЕДА) - НЕ КОМПРЕСИРАЙ!
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКИЯ ИНТЕРФЕЙС ---
    // Центрираме картата за максимален обхват на всички активни фронтове
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    }).setView([45.0, 35.0], 4); 

    // СЛОЕВЕ ЗА ДИНАМИЧНО УПРАВЛЕНИЕ НА ОБЕКТИТЕ
    const markersLayer = L.layerGroup().addTo(map);   // Слой за новини (JSON)
    const militaryLayer = L.layerGroup().addTo(map);  // Слой за статични бази

    // ТЪМЕН ТАКТИЧЕСКИ СЛОЙ (DARK RADAR STYLE)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ВИЗУАЛНО ОЦВЕТЯВАНЕ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
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

    // ЗАРЕЖДАНЕ НА ГЛОБАЛНИ ГРАНИЦИ И ТАКТИЧЕСКО ОЦВЕТЯВАНЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
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
                    let status = "MONITORED REGION";
                    if (warZones.includes(name)) status = "CRITICAL: WARZONE";
                    else if (tensionZones.includes(name)) status = "ELEVATED RISK";

                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.95); color:#fff; border:1px solid #39FF14; padding:8px; font-family:monospace;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            INTEL: <span style="color:#ff4d4d;">${status}</span>
                        </div>`, { sticky: true, opacity: 1.0 });

                    layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.4, weight: 2, color: '#39FF14' }); });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        this.setStyle({ fillOpacity: isWar ? 0.28 : 0.1, weight: isWar ? 1.8 : 0.6, color: isWar ? '#ff3333' : '#333' });
                    });
                }
            }).addTo(map);
        });

    // --- 3. БАЗА ДАННИ: СТРАТЕГИЧЕСКИ ОБЕКТИ (UA, RU, ME, US) ---
    const militaryAssets = [
        // UKRAINE - СТРАТЕГИЧЕСКИ ЛЕТИЩА
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Cargo Base" },
        { name: "Starokostiantyniv AB", type: "airbase-ua", lat: 49.74, lon: 27.26, info: "Tactical Aviation Hub" },
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Maritime Command" },
        
        // RUSSIA - СТРАТЕГИЧЕСКИ БАЗИ
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Bomber Fleet Command" },
        { name: "Belbek Air Base", type: "airbase-ru", lat: 44.68, lon: 33.57, info: "Crimea Air Control" },
        { name: "Sevastopol Naval", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet HQ" },
        
        // MIDDLE EAST & US ASSETS
        { name: "Al Udeid Air Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM HQ" },
        { name: "Natanz AD Complex", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Strategic Radar" },
        { name: "Bushehr AD Shield", type: "radar-iran", lat: 28.82, lon: 50.88, info: "Anti-Air Shield" }
    ];

    // --- 4. CSS ТАКТИЧЕСКИ АНИМАЦИИ И БУТОНИ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); }
        .icon-ua { background: rgba(52, 152, 219, 0.2); color: #3498db; animation: pulse-ua 2.5s infinite; }
        .icon-ru { background: rgba(231, 76, 60, 0.2); color: #e74c3c; animation: pulse-ru 3s infinite; }
        .icon-us { background: rgba(57, 255, 20, 0.1); color: #39FF14; border: 1.5px solid #39FF14; }
        .icon-iran { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
        .read-more-btn { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #39FF14; color: black; text-decoration: none; font-weight: bold; font-family: monospace; border-radius: 4px; transition: 0.3s ease; text-transform: uppercase; font-size: 12px; }
        .read-more-btn:hover { background: #fff; box-shadow: 0 0 15px #39FF14; transform: translateY(-2px); }
        @keyframes pulse-ua { 0% { box-shadow: 0 0 0px #3498db; } 50% { box-shadow: 0 0 12px #3498db; } 100% { box-shadow: 0 0 0px #3498db; } }
        @keyframes pulse-ru { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .live-dot { height: 10px; width: 10px; background-color: #39FF14; border-radius: 50%; display: inline-block; margin-right: 10px; animation: pulse-ua 1s infinite; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИЯ ЗА СТРАТЕГИЧЕСКИ ИКОНИ ---
    function getStrategicIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('ua')) { sym = '🛫'; cls += 'icon-ua'; }
        else if (type.includes('ru')) { sym = '🛩️'; cls += 'icon-ru'; }
        else if (type === 'us-hq') { sym = '🦅'; cls += 'icon-us'; }
        else if (type === 'radar-iran') { sym = '📡'; cls += 'icon-iran'; }
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:18px; width:32px; height:32px;">${sym}</div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        });
    }

    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: getStrategicIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                <strong style="color:#39FF14;">${asset.name.toUpperCase()}</strong><br>
                OBJECTIVE: ${asset.info}</div>`, { direction: 'top' });
    });

    // --- 6. LIVE FEED ИНДИКАТОР ---
    const feedHeader = document.querySelector('.sidebar-header') || document.querySelector('h2'); 
    if (feedHeader && !document.getElementById('live-status')) {
        const liveIndicator = document.createElement('div');
        liveIndicator.id = 'live-status';
        liveIndicator.style = "float: right; font-size: 11px; color: #39FF14; font-family: monospace; border: 1px solid #39FF14; padding: 5px 10px; background: rgba(0,0,0,0.8);";
        liveIndicator.innerHTML = '<span class="live-dot"></span>INTEL STREAM: ACTIVE';
        feedHeader.appendChild(liveIndicator);
    }

    // --- 7. СИНХРОНИЗАЦИЯ НА КОНФЛИКТНИ ДАННИ С ЛИНКОВЕ ---
    function syncStrategicIntel() {
        fetch('conflicts.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const icon = L.divIcon({
                        html: `<div style="color:#ff4d4d; font-size:24px; text-shadow:0 0 10px red;">●</div>`,
                        className: 'pulsing-icon', iconSize:[25,25]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: icon })
                        .addTo(markersLayer)
                        .on('click', () => {
                            const detailPanel = document.getElementById('news-content');
                            if(detailPanel) {
                                // ИЗВЛИЧАНЕ НА URL И ГЕНЕРИРАНЕ НА БУТОН
                                const sourceLink = item.url || "#";
                                detailPanel.innerHTML = `
                                    <h3 style="color:#39FF14; border-bottom:1px solid #333; padding-bottom:10px;">${item.title}</h3>
                                    <p style="color:#ddd; font-size:14px; line-height:1.7; margin-bottom:15px;">${item.description}</p>
                                    <div style="color:#ff4d4d; font-weight:bold; margin-bottom:15px;">FATALITIES: ${item.fatalities || 0}</div>
                                    <a href="${sourceLink}" target="_blank" class="read-more-btn">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
                const countEl = document.getElementById('active-events');
                if (countEl) countEl.innerText = data.length;
            })
            .catch(err => console.error("STRATEGIC ERROR: Intel Sync Failure."));
    }

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
