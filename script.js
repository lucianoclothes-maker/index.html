/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v14.0 - FINAL AUDIT VERSION
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | ФАЙЛ: alert.mp3
 * СТАТУС: ДВОЙНО ПРОВЕРЕН (SYSTEM CALIBRATED)
 * =============================================================================
 */

window.onload = function() {
    
    let lastEventId = ""; // Памет за последната новина

    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5
    }).setView([32.0, 45.0], 4.5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2, crossOrigin: true
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Spain', 'Bulgaria', 'Romania', 'Greece'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'Turkey', 'Saudi Arabia'];

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
                }
            }).addTo(map);
        });

    // --- 3. ВОЕННИ АСЕТИ ---
    const assets = [
        { name: "Fifth Fleet HQ", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Tehran Air Defense", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Port", type: "naval-ua", lat: 46.48, lon: 30.72 },
        { name: "Kyiv Command", type: "ua-hq", lat: 50.45, lon: 30.52 }
    ];

    // --- 4. ДИНАМИЧЕН CSS ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; }
        .icon-us { background: rgba(57, 255, 20, 0.4); border-color: #39FF14; }
        .icon-ir { background: rgba(255, 140, 0, 0.4); border-color: #ff8c00; }
        .pulse-intel { animation: pulse-green 2.5s infinite; cursor: pointer; }
        .pulse-critical { animation: pulse-red 1s infinite; cursor: pointer; filter: drop-shadow(0 0 15px #ff3131); }
        @keyframes pulse-red { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse-green { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .expanded-intel { position: fixed !important; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 620px; z-index: 10000; background: #0a0a0a; border: 2px solid #39FF14; box-shadow: 0 0 100px #000; }
        .intel-entry { border-left: 3px solid #39FF14; padding: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.03); }
        .close-trigger { cursor: pointer; color: #ff3131; border: 1px solid #ff3131; padding: 3px 12px; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ТАКТИЧЕСКИ ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.startsWith('us-')) { cls += 'icon-us'; sym = type.includes('naval') ? '⚓' : '🦅'; }
        else if (type.startsWith('ir-')) { cls += 'icon-ir'; sym = type.includes('pvo') ? '📡' : '☢️'; }
        else { cls += type.includes('ua') ? 'icon-ua' : 'icon-ru'; sym = '⚓'; }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:16px; width:32px; height:32px;">${sym}</div>`, iconSize: [32, 32] });
    }
    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (!container || !content) return;
        container.classList.add('expanded-intel');
        const hColor = (item.type === "Evacuation" || item.critical) ? '#ff3131' : '#39FF14';
        content.innerHTML = `
            <div style="background:rgba(57,255,20,0.15); padding:12px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                <span style="color:#39FF14; font-weight:bold;">TACTICAL REPORT</span>
                <span id="close-intel-btn" class="close-trigger">EXIT [X]</span>
            </div>
            <div style="padding:25px; color:white;">
                <h2 style="color:${hColor};">${item.title.toUpperCase()}</h2>
                <p>${item.description}</p>
                <div style="background:rgba(255,0,0,0.1); padding:15px; border-left:4px solid ${hColor}; margin:20px 0;">
                    STATUS: ${item.critical ? 'CRITICAL' : 'ACTIVE'} | SECTOR: ${item.type}
                </div>
                <a href="${item.link}" target="_blank" style="display:block; background:#39FF14; color:#000; padding:12px; text-align:center; font-weight:bold; text-decoration:none;">SECURE DATA FEED</a>
            </div>`;
        document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ И ЗВУК (alert.mp3) ---
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
                        const alertSound = new Audio('alert.mp3');
                        alertSound.play().catch(e => console.warn("Waiting for interaction..."));
                    }
                    lastEventId = latest.title;
                }
            }

            data.forEach(item => {
                const isCritical = item.type === "Evacuation" || item.critical === true;
                const sym = isCritical ? '🚨' : (item.type.includes('missile') ? '🚀' : '⚠️');
                const pClass = isCritical ? 'pulse-critical' : 'pulse-intel';
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="${pClass}" style="font-size:32px;">${sym}</div>`, iconSize:[40,40] }) 
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
        }).catch(err => console.error("JSON Error:", err));
    }

    syncIntel(); 
    setInterval(syncIntel, 60000); 
};

// --- 8. UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
