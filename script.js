/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v6.8 - MODAL FIX REVISION
 * =============================================================================
 * ОБЕКТ: Фикс на модалното разпъване + Глобална дефиниция на детайлите
 * ДАТА НА ВАЛИДАЦИЯ: 2026-02-21
 * АВТОР: Gemini Tactical AI (Personalized for Borislav)
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5
    }).setView([35.0, 20.0], 4); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela'];
    const monitoredZones = ['USA', 'United States', 'Germany', 'Turkey', 'United Kingdom', 'Poland'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    if (warZones.includes(name)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.35 };
                    if (highTension.includes(name)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.25 };
                    if (monitoredZones.includes(name)) return { fillColor: "#3498db", weight: 1.2, color: '#3498db', fillOpacity: 0.15 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let label = warZones.includes(name) ? "CRITICAL WARZONE" : (highTension.includes(name) ? "HIGH TENSION" : "MONITORED");
                    layer.bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                        <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>STATUS: ${label}</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. КРИТИЧЕН CSS ЗА МОДАЛА (ВАЖНО!) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.7); }
        .icon-ua { background: rgba(52, 152, 219, 0.4); color: #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.4); color: #e74c3c; }
        .icon-us { background: rgba(57, 255, 20, 0.2); color: #39FF14; border: 2px solid #39FF14; }
        .pulse-intel { animation: pulse-red 2.5s infinite; cursor: pointer; }
        @keyframes pulse-red { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .intel-entry { border-left: 2px solid #39FF14; padding: 10px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; background: rgba(0,0,0,0.3); }
        .intel-entry:hover { background: rgba(57, 255, 20, 0.1); }
        .read-more-btn { display: block; margin-top: 15px; padding: 12px; background: #39FF14; color: #000; font-weight: bold; text-align: center; text-decoration: none; border-radius: 4px; }
        
        /* СТИЛ ЗА ЦЕНТРАЛНИЯ МОДАЛ */
        #objective-details { 
            display: none; position: fixed !important; top: 50% !important; left: 50% !important; 
            transform: translate(-50%, -50%) !important; width: 450px !important; max-width: 90%; 
            background: rgba(5, 5, 5, 0.98) !important; border: 2px solid #39FF14 !important;
            z-index: 99999 !important; padding: 0 !important; box-shadow: 0 0 40px #000;
        }
        .modal-header { background: #39FF14; color: #000; padding: 10px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-family: monospace; }
        #modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 99998; }
        .close-x { cursor: pointer; background: #000; color: #39FF14; padding: 2px 8px; border: 1px solid #000; }
        .close-x:hover { background: #ff0000; color: #fff; }
    `;
    document.head.appendChild(styleSheet);

    // Създаваме Overlay ако не съществува
    const overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    document.body.appendChild(overlay);

    // --- 4. ФУНКЦИЯ ЗА СИМВОЛИ ---
    function getIntelIcon(type) {
        let symbol = '⚠️'; const t = type.toLowerCase();
        if (t.includes('airstrike') || t.includes('missile')) symbol = '🚀';
        else if (t.includes('clashes') || t.includes('fighting')) symbol = '⚔️';
        else if (t.includes('naval') || t.includes('ship')) symbol = '🚢';
        else if (t.includes('drone') || t.includes('uav')) symbol = '🛸';
        else if (t.includes('explosion') || t.includes('blast')) symbol = '💥';
        return L.divIcon({
            html: `<div class="pulse-intel" style="font-size:30px; text-align:center;">${symbol}</div>`,
            className: '', iconSize: [40, 40], iconAnchor: [20, 20]
        });
    }

    // --- 5. ГЛОБАЛНА ФУНКЦИЯ ЗА ПОКАЗВАНЕ НА ДЕТАЙЛИ ---
    window.openIntelModal = function(item) {
        const panel = document.getElementById('objective-details');
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('news-content');
        
        if(panel && content) {
            const finalUrl = item.link || item.url || "#";
            panel.style.display = "block";
            overlay.style.display = "block";
            
            content.innerHTML = `
                <div class="modal-header">
                    <span>SITREP: ${item.type.toUpperCase()}</span>
                    <span class="close-x" onclick="closeIntelModal()">[ X ]</span>
                </div>
                <div style="padding: 20px; color: #fff; font-family: monospace;">
                    <h2 style="color:#39FF14; margin-top:0;">${item.title}</h2>
                    <p style="color:#ccc; font-size:14px; line-height:1.5;">${item.description || "Intelligence data being processed..."}</p>
                    <div style="margin: 15px 0; border-top: 1px solid #333; padding-top:10px; color:#ff4d4d;">
                        <strong>LOCATION:</strong> ${item.country.toUpperCase()} | <strong>FATALITIES:</strong> ${item.fatalities}
                    </div>
                    <div style="font-size:11px; color:#666;">TIMESTAMP: ${item.date} UTC</div>
                    <a href="${finalUrl}" target="_blank" class="read-more-btn">OPEN FULL INTEL REPORT</a>
                </div>
            `;
            map.flyTo([item.lat, item.lon], 8);
        }
    };

    window.closeIntelModal = function() {
        document.getElementById('objective-details').style.display = "none";
        document.getElementById('modal-overlay').style.display = "none";
    };

    // --- 6. ОБРАБОТКА НА JSON ---
    function syncIntel() {
        fetch('conflicts.json?cache=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                const listContainer = document.getElementById('intel-list');
                if (listContainer) listContainer.innerHTML = ''; 

                data.forEach(item => {
                    // Маркер на картата
                    const marker = L.marker([item.lat, item.lon], { icon: getIntelIcon(item.type) }).addTo(markersLayer);
                    marker.on('click', () => window.openIntelModal(item));

                    // Елемент в списъка
                    if (listContainer) {
                        const entry = document.createElement('div');
                        entry.className = 'intel-entry';
                        entry.innerHTML = `
                            <small style="color: #39FF14;">[${item.date}]</small><br>
                            <strong style="color:#fff;">${item.title}</strong><br>
                            <span style="font-size: 10px; color: #ff4d4d;">${item.type.toUpperCase()} | ${item.country}</span>
                        `;
                        entry.onclick = () => window.openIntelModal(item);
                        listContainer.appendChild(entry);
                    }
                });
            }).catch(err => console.error("INTEL ERROR"));
    }

    // --- 7. ПОСТОЯННИ ОБЕКТИ ---
    const militaryAssets = [
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet" },
        { name: "Odesa Port", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Strategic Logistics" },
        { name: "Al Udeid Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM" }
    ];

    militaryAssets.forEach(a => {
        L.circleMarker([a.lat, a.lon], { radius: 6, color: '#39FF14', fillOpacity: 0.8 }).addTo(militaryLayer).bindTooltip(a.name);
    });

    syncIntel();
    setInterval(syncIntel, 60000); 
};

// --- 8. ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) {
        const d = new Date();
        el.innerText = d.getUTCHours().toString().padStart(2, '0') + ":" + 
                      d.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                      d.getUTCSeconds().toString().padStart(2, '0') + " UTC";
    }
}, 1000);
