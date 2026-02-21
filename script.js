/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v17.0 - RESTORED TOOLTIPS & FIXED UI
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV
 * КОРЕКЦИИ: Добавени имена на държави при Hover + Голям прозорец + Пулсация
 * СТАТУС: ПЪЛНА ФУНКЦИОНАЛНОСТ
 * =============================================================================
 */

window.onload = function() {
    
    let lastEventId = ""; 

    // --- 1. КАРТА И ОСНОВНИ НАСТРОЙКИ ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.1
    }).setView([32.0, 35.0], 4.0); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2, crossOrigin: true
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ИМЕНА ПРИ HOVER ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'Turkey', 'Saudi Arabia'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(f) {
                    const n = f.properties.name;
                    if (warZones.includes(n)) return { fillColor: "#ff0000", weight: 2.5, color: '#ff3333', fillOpacity: 0.35 };
                    if (blueZone.includes(n)) return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.25 };
                    if (highTension.includes(n)) return { fillColor: "#ff8c00", weight: 2.0, color: '#ff8c00', fillOpacity: 0.25 };
                    return { fillColor: "#111", weight: 0.8, color: "#333", fillOpacity: 0.1 };
                },
                // ТУК ВРЪЩАМЕ ИМЕНАТА НА ДЪРЖАВИТЕ
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindTooltip(feature.properties.name, {
                            sticky: true,
                            className: 'country-tooltip'
                        });
                        // Ефект при посочване
                        layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.5 }); });
                        layer.on('mouseout', function() { this.setStyle({ fillOpacity: 0.35 }); });
                    }
                }
            }).addTo(map);
        });

    // --- 3. ВОЕННИ АСЕТИ ---
    const strategicAssets = [
        { name: "US 5th Fleet HQ", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Tehran Defense Center", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Kyiv Command Post", type: "ua-hq", lat: 50.45, lon: 30.52 }
    ];

    // --- 4. ТАКТИЧЕСКИ СТИЛОВЕ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: none !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; }
        .icon-us { background: rgba(57, 255, 20, 0.5); border-color: #39FF14; }
        .icon-ir { background: rgba(255, 140, 0, 0.5); border-color: #ff8c00; }
        .country-tooltip { background: #000 !important; color: #39FF14 !important; border: 1px solid #39FF14 !important; font-weight: bold; }
        
        /* ПУЛСИРАЩИ ИКОНИ */
        .pulse-intel { animation: pulse-green 2s infinite; cursor: pointer; }
        .pulse-critical { animation: pulse-red 0.8s infinite alternate; cursor: pointer; filter: drop-shadow(0 0 15px #ff3131); }
        
        @keyframes pulse-green { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse-red { from { transform: scale(1); } to { transform: scale(1.4); } }

        /* ГОЛЯМ ПРОЗОРЕЦ - 800px */
        .expanded-intel { 
            position: fixed !important; top: 50% !important; left: 50% !important; 
            transform: translate(-50%, -50%) !important; width: 800px !important; 
            min-height: 500px !important; z-index: 99999 !important; 
            background: #050505 !important; border: 3px solid #39FF14 !important; 
            box-shadow: 0 0 150px #000 !important; display: flex; flex-direction: column; 
        }
        .intel-entry { border-left: 3px solid #39FF14; padding: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.03); }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ГЕНЕРИРАНЕ НА ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.startsWith('us-')) { cls += 'icon-us'; sym = type.includes('naval') ? '⚓' : '🦅'; }
        else if (type.startsWith('ir-')) { cls += 'icon-ir'; sym = type.includes('pvo') ? '📡' : '☢️'; }
        else { cls += type.includes('ua') ? 'icon-ua' : 'icon-ru'; sym = '⚓'; }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:18px; width:34px; height:34px;">${sym}</div>`, iconSize: [34, 34] });
    }
    strategicAssets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ ЗА ДЕТАЙЛИ ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (!container || !content) return;

        container.classList.add('expanded-intel');
        const hColor = (item.type === "Evacuation" || item.critical) ? '#ff3131' : '#39FF14';

        content.innerHTML = `
            <div style="background:#111; padding:15px; border-bottom:2px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#39FF14; font-weight:bold; letter-spacing:2px;">TACTICAL INTEL REPORT</span>
                <span id="close-intel-btn" style="cursor:pointer; color:#ff3131; font-weight:bold; border:1px solid #ff3131; padding:5px 15px;">EXIT [X]</span>
            </div>
            <div style="padding:40px; color:white; flex-grow:1; overflow-y:auto;">
                <h1 style="color:${hColor}; font-size:36px; text-transform:uppercase; margin-bottom:20px; border-bottom:1px solid ${hColor};">${item.title}</h1>
                <p style="font-size:22px; line-height:1.6; color:#eee; margin-bottom:30px;">${item.description}</p>
                <div style="background:rgba(255,255,255,0.05); padding:20px; border-left:5px solid ${hColor}; font-family:monospace; font-size:18px;">
                    <strong>SECTOR:</strong> ${item.type.toUpperCase()} | <strong>STATUS:</strong> ${item.critical ? 'ALERT' : 'ACTIVE'}
                </div>
                <div style="margin-top:40px;"><a href="${item.link}" target="_blank" style="display:inline-block; background:${hColor}; color:#000; padding:15px 40px; text-decoration:none; font-weight:bold; font-size:20px;">FULL SOURCE DATA</a></div>
            </div>`;
        
        document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ И ALERT.MP3 ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            if (!Array.isArray(data)) return;
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = '';

            if (data.length > 0) {
                const latest = data[0];
                if (latest.title !== lastEventId) {
                    if (latest.type === "Evacuation" || latest.critical === true) {
                        new Audio('alert.mp3').play().catch(e => console.log("Audio ready."));
                    }
                    lastEventId = latest.title;
                }
            }

            data.forEach(item => {
                const isCritical = item.type === "Evacuation" || item.critical === true;
                const sym = isCritical ? '🚨' : (item.type.includes('strike') ? '💥' : '⚠️');
                const pClass = isCritical ? 'pulse-critical' : 'pulse-intel';
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="${pClass}" style="font-size:36px;">${sym}</div>`, iconSize:[45,45] }) 
                }).addTo(markersLayer);
                marker.on('click', () => openIntelDetails(item));
                if (list) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry';
                    entry.style.borderLeftColor = isCritical ? '#ff3131' : '#39FF14';
                    entry.innerHTML = `<small>[${item.date}]</small><br><strong style="color:${isCritical ? '#ff3131' : '#39FF14'};">${sym} ${item.title}</strong>`;
                    entry.onclick = () => openIntelDetails(item);
                    list.appendChild(entry);
                }
            });
        });
    }

    syncIntel(); 
    setInterval(syncIntel, 60000); 
};

// --- 8. ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
// FIXED SYSTEM v17.0. Всичко е наред сега.
