/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v12.8 - PROPORTIONAL UI
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | СТАТУС: ОПТИМИЗИРАН МОДАЛ (650PX)
 * -----------------------------------------------------------------------------
 * КОРЕКЦИИ:
 * 1. Намален размер на прозореца за детайли за по-добра видимост на картата.
 * 2. Пълна интеграция на звук alert.mp3 при нови критични събития.
 * 3. Запазени всички икони за бази (⚓, 🦅, 📡) и ПВО системи.
 * 4. Пълен код от 250 реда - без съкращения на логиката.
 * =============================================================================
 */

window.onload = function() {
    
    // Глобална променлива за следене на новините и звуковата сигнализация
    let lastTrackedEvent = ""; 

    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКАТА КАРТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5,
        wheelDebounceTime: 50
    }).setView([32.0, 45.0], 4.5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    // Тъмен слой за военна визуализация (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, 
        minZoom: 2, 
        crossOrigin: true
    }).addTo(map);

    // --- 2. ДЕФИНИРАНЕ НА ГЕОПОЛИТИЧЕСКИ ЗОНИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Spain', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'Turkey', 'Saudi Arabia'];

    // Зареждане на границите и добавяне на интерактивни етикети
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(f) {
                    const n = f.properties.name;
                    if (warZones.includes(n)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.3 };
                    if (blueZone.includes(n)) return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.25 };
                    if (highTension.includes(n)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.2 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(f, l) {
                    const n = f.properties.name;
                    // Създаване на динамичен Tooltip при посочване
                    l.bindTooltip(`<div style="background:black; color:#39FF14; border:1px solid #39FF14; padding:5px; font-family:monospace;">${n.toUpperCase()}</div>`, { sticky: true });
                    l.on('mouseover', function() { this.setStyle({ fillOpacity: 0.4 }); });
                    l.on('mouseout', function() { this.setStyle({ fillOpacity: 0.25 }); });
                }
            }).addTo(map);
        });

    // --- 3. ТАКТИЧЕСКИ АСЕТИ (БАЗИ И ПВО) ---
    const assets = [
        { name: "US 5th Fleet HQ", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base", type: "us-air", lat: 25.11, lon: 51.21 },
        { name: "Tehran Air Defense", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Sevastopol Naval Base", type: "ru-naval", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "ua-port", lat: 46.48, lon: 30.72 },
        { name: "Kyiv Command Bunker", type: "ua-hq", lat: 50.45, lon: 30.52 },
        { name: "Bushehr Defense", type: "ir-pvo", lat: 28.82, lon: 50.88 },
        { name: "Tartus Logistics", type: "ru-naval", lat: 34.88, lon: 35.88 }
    ];

    // --- 4. ДИНАМИЧЕН CSS (ОПТИМИЗИРАН ЗА 650PX) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 10px #000; }
        .icon-us { background: rgba(57, 255, 20, 0.5); border-color: #39FF14; }
        .icon-ir { background: rgba(255, 140, 0, 0.5); border-color: #ff8c00; }
        .icon-ru { background: rgba(255, 0, 0, 0.5); border-color: #ff3131; }
        
        .pulse-intel { animation: pulse-red 1.5s infinite alternate; cursor: pointer; }
        @keyframes pulse-red { from { transform: scale(1); opacity: 1; } to { transform: scale(1.3); opacity: 0.6; } }
        
        /* КОРЕКЦИЯ НА РАЗМЕРА: 650PX ВМЕСТО 800PX */
        .expanded-intel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 650px !important;
            min-height: 480px !important; z-index: 99999 !important;
            background: rgba(5, 5, 5, 0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 120px #000; display: flex; flex-direction: column;
        }
        .intel-entry { border-left: 3px solid #39FF14; padding: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.03); }
        .close-trigger { cursor: pointer; color: #ff3131; border: 1px solid #ff3131; padding: 4px 14px; font-weight: bold; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ЛОГИКА ЗА ИКОНИТЕ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.startsWith('us-')) { cls += 'icon-us'; sym = type.includes('naval') ? '⚓' : '🦅'; }
        else if (type.startsWith('ir-')) { cls += 'icon-ir'; sym = type.includes('pvo') ? '📡' : '☢️'; }
        else if (type.startsWith('ru-')) { cls += 'icon-ru'; sym = '⚓'; }
        else { cls += 'icon-ua'; sym = '🚢'; }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:17px; width:34px; height:34px;">${sym}</div>`, iconSize: [34, 34] });
    }

    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ ЗА ДЕТАЙЛИ ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (container && content) {
            container.classList.add('expanded-intel');
            content.innerHTML = `
                <div style="background:#111; padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#39FF14; font-weight:bold; letter-spacing:1px; font-family:monospace;">>> TACTICAL DATA</span>
                    <span id="close-intel-btn" class="close-trigger">EXIT [X]</span>
                </div>
                <div style="padding:35px; color:white; font-family:monospace;">
                    <h1 style="color:#39FF14; margin-top:0; font-size:30px; border-bottom:1px solid #333; padding-bottom:10px;">${item.title.toUpperCase()}</h1>
                    <p style="font-size:18px; line-height:1.5; color:#ddd;">Sector: ${item.country || "Global"}<br><br>${item.description || "Intercepted data feed active."}</p>
                    <div style="background:rgba(255,0,0,0.1); padding:20px; border-left:4px solid #ff3131; margin:25px 0;">
                        <strong>THREAT LEVEL:</strong> CRITICAL<br>
                        <strong>POS:</strong> ${item.lat.toFixed(3)}, ${item.lon.toFixed(3)}
                    </div>
                    <a href="${item.link || "#"}" target="_blank" style="display:block; background:#39FF14; color:#000; padding:15px; text-align:center; font-weight:bold; text-decoration:none; font-size:18px;">SECURE SOURCE</a>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ И АУДИО АЛАРМА ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            if (!Array.isArray(data)) return;
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 

            // Логика за автоматичен звук при нова информация
            if (data.length > 0 && data[0].title !== lastTrackedEvent) {
                if (data[0].critical === true || data[0].type === "Evacuation") {
                    new Audio('alert.mp3').play().catch(e => console.log("Waiting for user click."));
                }
                lastTrackedEvent = data[0].title;
            }

            data.forEach(item => {
                const sym = item.critical ? '🚨' : '⚠️';
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="pulse-intel" style="font-size:36px;">${sym}</div>`, iconSize:[45,45] }) 
                }).addTo(markersLayer);
                marker.on('click', () => openIntelDetails(item));
                if (list) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry';
                    entry.innerHTML = `<small>[${item.date}]</small><br><strong style="color:#39FF14;">${item.title}</strong>`;
                    entry.onclick = () => openIntelDetails(item);
                    list.appendChild(entry);
                }
            });
        });
    }

    syncIntel(); setInterval(syncIntel, 60000);
};

// --- 8. СИСТЕМЕН ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/**
 * КРАЙ НА СКРИПТА - v12.8
 * ВСИЧКИ СИСТЕМИ СА ОПЕРАТИВНИ
 */
