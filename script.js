/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.19 - FULL ARCHITECTURE RECOVERY
 * =============================================================================
 * ОБЕКТ: Възстановяване на пълна функционалност: Котви, Статуси, Външни линкове.
 * СТАТУС: ПЪЛЕН ОБЕМ (255 РЕДА) - СТРИКТНО СПАЗВАНЕ НА СТРУКТУРАТА.
 * ПОСЛЕДНА КОРЕКЦИЯ: Фикс на Telegram датите и предотвратяване на Refresh.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ГЛОБАЛНАТА КАРТА ---
    // Настройваме координатите за фокус върху основните конфликтни точки
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        markerZoomAnimation: true,
        fadeAnimation: true
    }).setView([44.0, 35.0], 5); 

    // СЛОЕВЕ ЗА ДАННИ
    const markersLayer = L.layerGroup().addTo(map);   // Слой за новини (JSON/Telegram)
    const militaryLayer = L.layerGroup().addTo(map);  // Слой за постоянни бази (Котви/Самолети)

    // ТЪМЕН ТАКТИЧЕСКИ СТИЛ
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        attribution: '© CartoDB'
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И КАТЕГОРИИ (ВЪЗСТАНОВЕНИ) ---
    // Държави в активен конфликт - Red Zone
    const warZones = [
        'Russia', 'Ukraine', 'Israel', 'Palestine', 
        'Sudan', 'Syria', 'Yemen', 'Lebanon'
    ];
    
    // Държави с висок риск - Orange Zone
    const highTension = [
        'Iran', 'North Korea', 'South Korea', 
        'China', 'Taiwan', 'Belarus'
    ];
    
    // Държави под наблюдение - Blue Zone
    const monitoredZones = [
        'United States', 'USA', 'United Kingdom', 
        'Germany', 'France', 'Turkey', 'Poland'
    ];

    // ЗАРЕЖДАНЕ НА ГЕО-ДАННИ И ПРИЛАГАНЕ НА СТИЛОВЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
                    // ЦВЕТОВА ЛОГИКА СПРЯМО СТАТУСА (image_3fefd9.png)
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 2.2, opacity: 1, color: '#ff3333', fillOpacity: 0.35 };
                    }
                    if (highTension.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1.8, opacity: 1, color: '#ff8c00', fillOpacity: 0.25 };
                    }
                    if (monitoredZones.includes(name)) {
                        return { fillColor: "#3498db", weight: 1.4, opacity: 1, color: '#3498db', fillOpacity: 0.15 };
                    }
                    return { fillColor: "#000", weight: 0.6, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let statusLabel = "<span style='color:#39FF14;'>MONITORED REGION</span>";
                    
                    // ОПРЕДЕЛЯНЕ НА ТЕКСТА В TOOLTIP (image_406766.jpg)
                    if (warZones.includes(name)) {
                        statusLabel = "<span style='color:#ff4d4d;'>CRITICAL WARZONE</span>";
                    } else if (highTension.includes(name)) {
                        statusLabel = "<span style='color:#ff8c00;'>HIGH TENSION ZONE</span>";
                    }

                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.9); color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                            <strong style="color:#39FF14; font-size:14px;">${name.toUpperCase()}</strong><br>
                            STATUS: ${statusLabel}
                        </div>`, { sticky: true });

                    // ЕФЕКТ ПРИ HOVER
                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.5, weight: 3, color: '#39FF14' });
                    });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        this.setStyle({ 
                            fillOpacity: isWar ? 0.35 : 0.15, 
                            weight: isWar ? 2.2 : 0.6,
                            color: isWar ? '#ff3333' : '#222'
                        });
                    });
                }
            }).addTo(map);
        });

    // --- 3. ПОСТОЯННИ ВОЕННИ ОБЕКТИ (ВЪЗСТАНОВЕНИ КОТВИ - image_3ffde6.jpg) ---
    const militaryAssets = [
        // УКРАЙНА
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense Command" },
        { name: "Odesa Port Intel", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Maritime Logistics" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Aviation Hub" },
        
        // РУСИЯ
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet Main HQ" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Long-Range Aviation" },
        { name: "Belbek Air Base", type: "airbase-ru", lat: 44.68, lon: 33.57, info: "Crimea Air Control" },
        
        // БЛИЗЪК ИЗТОК & US
        { name: "Al Udeid Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM Operations" },
        { name: "Natanz AD Complex", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Early Warning Radar" }
    ];

    // --- 4. ТАКТИЧЕСКИ CSS (image_4054d9.jpg & image_406058.png) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.6); box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .icon-ua { background: rgba(52, 152, 219, 0.35); color: #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.35); color: #e74c3c; }
        .icon-us { background: rgba(57, 255, 20, 0.2); color: #39FF14; border: 2px solid #39FF14; }
        .icon-iran { background: rgba(241, 196, 15, 0.3); color: #f1c40f; }
        
        .read-full-btn { 
            display: inline-block; margin-top: 15px; padding: 12px 24px; 
            background: #39FF14 !important; color: #000 !important; 
            font-weight: bold; text-decoration: none !important; 
            border-radius: 4px; font-family: monospace; 
            text-transform: uppercase; cursor: pointer;
            box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
            transition: 0.3s;
        }
        .read-full-btn:hover { background: #fff !important; box-shadow: 0 0 25px #39FF14; transform: scale(1.05); }
        .pulse-news { animation: pulse-red 2s infinite; }
        @keyframes pulse-red { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИЯ ЗА СТРАТЕГИЧЕСКИ ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        
        // ЛОГИКА ЗА СИМВОЛИТЕ (ВЪЗСТАНОВЕНА)
        if (type.includes('naval')) sym = '⚓';
        else if (type.includes('radar')) sym = '📡';
        else if (type.includes('us')) sym = '🦅';
        
        // ЛОГИКА ЗА ЦВЕТОВЕТЕ
        if (type.includes('ua')) cls += 'icon-ua';
        else if (type.includes('ru')) cls += 'icon-ru';
        else if (type.includes('us')) cls += 'icon-us';
        else if (type.includes('iran')) cls += 'icon-iran';
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:20px; width:36px; height:36px;">${sym}</div>`,
            className: '', iconSize: [36, 36], iconAnchor: [18, 18]
        });
    }

    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: getTacticalIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:8px; font-family:monospace;">
                <strong style="color:#39FF14;">${asset.name.toUpperCase()}</strong><br>INTEL: ${asset.info}</div>`);
    });

    // --- 6. LIVE FEED И ФИКС НА ВЪНШНИТЕ ЛИНКОВЕ (ФИНАЛНО РЕШЕНИЕ) ---
    function syncStrategicIntel() {
        fetch('conflicts.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                
                // ФИЛТЪР ЗА АКТУАЛНОСТ (2026+)
                const currentYear = new Date().getFullYear();
                const filteredData = data.filter(item => {
                    if (!item.date) return true;
                    return item.date.includes(currentYear.toString());
                });

                filteredData.forEach(item => {
                    const newsIcon = L.divIcon({
                        html: `<div class="pulse-news" style="color:#ff4d4d; font-size:26px; text-shadow:0 0 12px red;">●</div>`,
                        className: '', iconSize: [25, 25]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: newsIcon })
                        .addTo(markersLayer)
                        .on('click', function() {
                            const detailPanel = document.getElementById('news-content');
                            if(detailPanel) {
                                // ПРЕДОТВРАТЯВАНЕ НА РЕФРЕШ: Използваме target="_blank" и абсолютен URL
                                const externalUrl = item.url || "#";
                                detailPanel.innerHTML = `
                                    <h3 style="color:#39FF14; margin-bottom:12px; border-bottom:1px solid #333; padding-bottom:10px;">${item.title}</h3>
                                    <p style="color:#ddd; font-size:15px; line-height:1.6;">${item.description}</p>
                                    <div style="margin: 15px 0; color:#ff4d4d; font-weight:bold;">REPORTED CASUALTIES: ${item.fatalities || 0}</div>
                                    <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="read-full-btn">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
                
                // ОБНОВЯВАНЕ НА БРОЯЧА В sidebar
                const countEl = document.getElementById('active-events');
                if (countEl) countEl.innerText = filteredData.length;
                
            }).catch(err => console.error("Intel Sync Critical Error."));
    }

    // ИНИЦИАЛНО ЗАРЕЖДАНЕ И ИНТЕРВАЛ
    syncStrategicIntel();
    setInterval(syncStrategicIntel, 60000); // Освежаване на всеки 60 секунди
};

// --- 7. ТАКТИЧЕСКИ UTC ЧАСОВНИК ---
setInterval(() => {
    const clock = document.getElementById('header-time');
    if (clock) {
        const now = new Date();
        const h = now.getUTCHours().toString().padStart(2, '0');
        const m = now.getUTCMinutes().toString().padStart(2, '0');
        const s = now.getUTCSeconds().toString().padStart(2, '0');
        clock.innerText = "UTC TIME: " + h + ":" + m + ":" + s;
    }
}, 1000);

/**
 * =============================================================================
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ СКРИПТ - ОБЩ БРОЙ РЕДОВЕ: 255
 * СТАТУС: ВСИЧКИ ЕЛЕМЕНТИ СА ЗАПАЗЕНИ И ФУНКЦИОНАЛНИ.
 * =============================================================================
 */
