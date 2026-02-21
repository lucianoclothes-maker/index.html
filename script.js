/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v7.8 - ULTIMATE COMMANDER EDITION
 * =============================================================================
 * ОБЕКТ: Пълна интеграция на разпъващ се "Objective Details" прозорец
 * ПРАВИЛО: Без триене на съществуващ код. Пълен обем от 250 реда.
 * ВАЛИДАЦИЯ: 2026-02-21 | Борислав - Стратегическо командване
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ГЛОБАЛНАТА КАРТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5,
        wheelDebounceTime: 150
    }).setView([35.0, 20.0], 4); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    // ТЪМЕН ТАКТИЧЕСКИ СЛОЙ (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        subdomains: 'abcd'
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ГРАНИЦИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela'];
    const monitoredZones = ['USA', 'United States', 'Germany', 'Turkey', 'United Kingdom', 'Poland'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    if (warZones.includes(name)) return { fillColor: "#ff0000", weight: 2.5, color: '#ff3333', fillOpacity: 0.35 };
                    if (highTension.includes(name)) return { fillColor: "#ff8c00", weight: 2.0, color: '#ff8c00', fillOpacity: 0.25 };
                    if (monitoredZones.includes(name)) return { fillColor: "#3498db", weight: 1.5, color: '#3498db', fillOpacity: 0.15 };
                    return { fillColor: "#1a1a1a", weight: 0.8, color: "#333", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let label = "<span style='color:#39FF14;'>MONITORED REGION</span>";
                    if (warZones.includes(name)) label = "<span style='color:#ff4d4d;'>CRITICAL WARZONE</span>";
                    else if (highTension.includes(name)) label = "<span style='color:#ff8c00;'>HIGH TENSION ZONE</span>";

                    layer.bindTooltip(`<div style="background:rgba(0,0,0,0.9); color:white; border:1px solid #39FF14; padding:10px; font-family:monospace; box-shadow: 0 0 15px rgba(0,0,0,0.5);">
                        <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>STATUS: ${label}<br>DATA: ENCRYPTED</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. ПОСТОЯННИ ВОЕННИ ОБЕКТИ (ПЪЛЕН СПИСЪК) ---
    const militaryAssets = [
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense Group" },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet Headquarters" },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Strategic Maritime Logistics" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Tactical Air Cargo Base" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Long-Range Bomber Command" },
        { name: "Al Udeid Air Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM Forward HQ" },
        { name: "Tartus Naval Facility", type: "naval-ru", lat: 34.89, lon: 35.88, info: "Mediterranean Logistics Base" },
        { name: "Kyiv Command Center", type: "hq-ua", lat: 50.45, lon: 30.52, info: "General Staff Operations" }
    ];

    // --- 4. КРИТИЧЕН CSS ЗА МОДАЛА И ТАКТИЧЕСКИ ЕФЕКТИ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.8); box-shadow: 0 0 8px rgba(0,0,0,0.6); }
        .icon-ua { background: rgba(52, 152, 219, 0.5); color: #fff; border: 1.5px solid #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.5); color: #fff; border: 1.5px solid #e74c3c; }
        .icon-us { background: rgba(57, 255, 20, 0.2); color: #39FF14; border: 2px solid #39FF14; }
        .pulse-intel { animation: pulse-red 2.5s infinite; filter: drop-shadow(0 0 8px red); }
        @keyframes pulse-red { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .intel-entry { border-left: 2px solid #39FF14; padding: 12px; margin-bottom: 15px; cursor: pointer; transition: 0.3s; background: rgba(30,30,30,0.3); }
        .intel-entry:hover { background: rgba(57, 255, 20, 0.1); border-left-width: 6px; }
        
        /* ЦЕНТРАЛНО РАЗПЪВАНЕ НА OBJECTIVE DETAILS */
        #objective-details.expanded {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 550px !important;
            max-width: 95vw; height: auto !important; z-index: 99999 !important;
            background: rgba(5, 5, 5, 0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 100px rgba(0,0,0,1), 0 0 30px rgba(57, 255, 20, 0.3);
            display: block !important; padding: 0 !important; overflow: hidden;
            animation: modalFade 0.3s ease-out;
        }
        @keyframes modalFade { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        .modal-header-tactical { background: #39FF14; color: #000; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-family: 'Courier New', monospace; }
        .close-btn-tactical { cursor: pointer; background: #000; color: #39FF14; padding: 4px 12px; border: 1px solid #000; transition: 0.2s; }
        .close-btn-tactical:hover { background: #ff4d4d; color: #fff; }
        .read-more-btn { display: block !important; margin-top: 20px !important; padding: 15px !important; background: #39FF14 !important; color: #000 !important; font-weight: bold !important; text-decoration: none !important; text-align: center; border: none; cursor: pointer; text-transform: uppercase; }
        .read-more-btn:hover { background: #fff !important; box-shadow: 0 0 20px #39FF14; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИИ ЗА ГЕНЕРИРАНЕ НА ИКОНИ ---
    function getIntelIcon(type) {
        let symbol = '⚠️'; const t = type.toLowerCase();
        if (t.includes('airstrike') || t.includes('missile')) symbol = '🚀';
        else if (t.includes('clashes') || t.includes('fighting')) symbol = '⚔️';
        else if (t.includes('naval') || t.includes('ship')) symbol = '🚢';
        else if (t.includes('drone') || t.includes('uav')) symbol = '🛸';
        else if (t.includes('explosion') || t.includes('blast')) symbol = '💥';
        else if (t.includes('nuclear')) symbol = '☢️';
        return L.divIcon({ html: `<div class="pulse-intel" style="font-size:32px; width:45px; text-align:center;">${symbol}</div>`, className: '', iconSize: [45, 45], iconAnchor: [22, 22] });
    }

    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('naval')) sym = '⚓';
        else if (type.includes('us')) sym = '🦅';
        else if (type.includes('hq')) sym = '🏯';
        if (type.includes('ua')) cls += 'icon-ua';
        else if (type.includes('ru')) cls += 'icon-ru';
        else if (type.includes('us')) cls += 'icon-us';
        return L.divIcon({ html: `<div class="${cls}" style="font-size:18px; width:34px; height:34px;">${sym}</div>`, className: '', iconSize: [34, 34] });
    }

    militaryAssets.forEach(a => {
        L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(`<b>${a.name}</b><br>LOG: ${a.info}`);
    });

    // --- 6. ОБРАБОТКА НА ИНТЕЛ И ЕКСПАНЗИЯ ---
    function syncIntel() {
        console.log("System Check: Fetching Satellite Intel...");
        fetch('conflicts.json?cache=' + Date.now()).then(res => res.json()).then(data => {
            markersLayer.clearLayers();
            const listContainer = document.getElementById('intel-list');
            if (listContainer) listContainer.innerHTML = ''; 

            data.forEach(item => {
                const marker = L.marker([item.lat, item.lon], { icon: getIntelIcon(item.type) }).addTo(markersLayer);
                
                const openTacticalModal = () => {
                    const panel = document.getElementById('objective-details');
                    const content = document.getElementById('news-content');
                    if(panel && content) {
                        panel.classList.add('expanded');
                        content.innerHTML = `
                            <div class="modal-header-tactical">
                                <span>[ DATA LINK ENCRYPTED ] ID: ${Math.floor(Math.random()*9999)}</span>
                                <span class="close-btn-tactical" onclick="document.getElementById('objective-details').classList.remove('expanded')">CLOSE [X]</span>
                            </div>
                            <div style="padding: 25px; color: #fff; font-family: monospace;">
                                <h2 style="color:#39FF14; margin:0 0 15px 0; border-bottom: 1px solid #333; padding-bottom: 10px;">${item.title}</h2>
                                <p style="font-size:16px; line-height:1.7; color:#ececec;">${item.description || "Intelligence gathering in progress for sector " + item.country + "."}</p>
                                <div style="margin: 20px 0; background: rgba(255,0,0,0.1); padding: 15px; border-left: 4px solid #ff4d4d;">
                                    <strong>INCIDENT TYPE:</strong> ${item.type.toUpperCase()}<br>
                                    <strong>REPORTED CASUALTIES:</strong> ${item.fatalities}<br>
                                    <strong>GEOLOCATION:</strong> ${item.country.toUpperCase()} [${item.lat}, ${item.lon}]
                                </div>
                                <div style="font-size:12px; color:#555; text-align:right;">SATELLITE TS: ${item.date} UTC</div>
                                <a href="${item.link || item.url || "#"}" target="_blank" class="read-more-btn">ACCESS FULL SECURE FEED</a>
                            </div>`;
                    }
                    map.flyTo([item.lat, item.lon], 7, { animate: true, duration: 1.5 });
                };

                marker.on('click', openTacticalModal);
                if (listContainer) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry';
                    entry.innerHTML = `
                        <small style="color: #666;">[${item.date}]</small><br>
                        <strong style="color:#fff; text-transform:uppercase;">${item.title}</strong><br>
                        <span style="font-size: 11px; color: #ff4d4d;">SIGNAL: ${item.type.toUpperCase()} | ${item.country}</span>
                    `;
                    entry.onclick = openTacticalModal;
                    listContainer.appendChild(entry);
                }
            });
        }).catch(err => console.error("SIGNAL LOST: JSON error."));
    }

    // --- 7. КОНТРОЛНИ СИСТЕМИ ---
    syncIntel();
    setInterval(syncIntel, 60000); 
    console.log("%c GLOBAL STRATEGIC MAP LOADED ", "background: #000; color: #39FF14; font-size: 18px; font-weight: bold;");
};

// --- 8. РЕАЛНО ВРЕМЕ UTC ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) {
        const d = new Date();
        el.innerText = d.getUTCHours().toString().padStart(2, '0') + ":" + 
                      d.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                      d.getUTCSeconds().toString().padStart(2, '0') + " UTC";
    }
}, 1000);

// --- 9. ERROR HANDLING ---
window.onerror = function(msg, url, line) {
    console.error("COMMAND ERROR: Line " + line + " - " + msg);
    return false;
};
/** КРАЙ НА СИСТЕМНИЯ СКРИПТ v7.8 **/
