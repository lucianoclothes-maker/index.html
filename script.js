/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v9.0 - DYNAMIC VIEW REVISION
 * =============================================================================
 * ОБЕКТ: Разпъване на "Objective Details" в центъра при клик и връщане обратно.
 * ПРАВИЛО: Пълен код (250 реда). Всички тактически обекти са налични.
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
                style: function(f) {
                    const n = f.properties.name;
                    if (warZones.includes(n)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.35 };
                    if (highTension.includes(n)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.25 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(f, l) {
                    const n = f.properties.name;
                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:8px;">${n.toUpperCase()}</div>`);
                }
            }).addTo(map);
        });

    // --- 3. СТРАТЕГИЧЕСКИ АКТИВИ (ВЪЗСТАНОВЕНИ) ---
    const militaryAssets = [
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense" },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet" },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Maritime Logistics" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Air Cargo Base" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Bomber Command" },
        { name: "Al Udeid Air Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM HQ" },
        { name: "Tartus Naval Base", type: "naval-ru", lat: 34.89, lon: 35.88, info: "Mediterranean Fleet" },
        { name: "Kyiv Command", type: "ua-hq", lat: 50.45, lon: 30.52, info: "Operational HQ" }
    ];

    // --- 4. CSS ЗА ДИНАМИЧНО ПОВЕДЕНИЕ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid #fff; }
        .icon-ua { background: rgba(52, 152, 219, 0.6); } .icon-ru { background: rgba(231, 76, 60, 0.6); }
        .icon-us { background: rgba(57, 255, 20, 0.3); border-color: #39FF14; }
        .pulse-intel { animation: pulse-red 2s infinite; cursor: pointer; }
        @keyframes pulse-red { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .intel-entry { border-left: 2px solid #39FF14; padding: 10px; margin-bottom: 8px; cursor: pointer; background: rgba(0,0,0,0.4); transition: 0.3s; }
        .intel-entry:hover { background: rgba(57, 255, 20, 0.1); }
        
        /* СТИЛ ЗА РАЗПЪВАНЕ В ЦЕНТЪРА */
        .expanded-objective {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 550px !important;
            height: auto !important; z-index: 99999 !important;
            background: rgba(5, 5, 5, 0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 100px #000 !important; padding: 25px !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИИ ЗА ИКОНИ ---
    function getIntelIcon(type) {
        let symbol = '⚠️'; const t = type.toLowerCase();
        if (t.includes('airstrike')) symbol = '🚀'; else if (t.includes('clashes')) symbol = '⚔️';
        else if (t.includes('naval')) symbol = '🚢'; else if (t.includes('drone')) symbol = '🛸';
        return L.divIcon({ html: `<div class="pulse-intel" style="font-size:30px; text-align:center;">${symbol}</div>`, className: '', iconSize: [40, 40] });
    }

    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('naval')) sym = '⚓'; else if (type.includes('us')) sym = '🦅';
        if (type.includes('ua')) cls += 'icon-ua'; else if (type.includes('ru')) cls += 'icon-ru'; else cls += 'icon-us';
        return L.divIcon({ html: `<div class="${cls}" style="font-size:18px; width:32px; height:32px;">${sym}</div>`, className: '', iconSize: [32, 32] });
    }

    militaryAssets.forEach(a => {
        L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name);
    });

    // --- 6. ЛОГИКА ЗА РАЗПЪВАНЕ И СВИВАНЕ ---
    const showIntelDetails = (item) => {
        const panel = document.getElementById('objective-details');
        const content = document.getElementById('news-content');
        
        if (panel && content) {
            // Добавяме класа за разпъване в центъра
            panel.classList.add('expanded-objective');
            panel.style.display = "block";
            
            content.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px;">
                    <span style="color:#39FF14; font-family:monospace;">SITUATION REPORT: ${item.type.toUpperCase()}</span>
                    <span id="close-btn" style="cursor:pointer; color:#ff4d4d; border:1px solid #ff4d4d; padding:2px 10px; font-weight:bold;">[ X ]</span>
                </div>
                <h2 style="color:#fff; margin-bottom:10px;">${item.title}</h2>
                <p style="color:#ccc; line-height:1.6; font-size:15px;">${item.description || "Intelligence data for sector " + item.country + " is being updated..."}</p>
                <div style="margin:20px 0; color:#ff4d4d; font-family:monospace;">
                    LOCATION: ${item.country.toUpperCase()} | IMPACT: ${item.fatalities} CASUALTIES
                </div>
                <a href="${item.link || "#"}" target="_blank" style="display:block; background:#39FF14; color:#000; text-align:center; padding:12px; font-weight:bold; text-decoration:none; text-transform:uppercase;">Open Full Intelligence Report</a>
            `;

            // Логика за затваряне и връщане "долу вдясно"
            document.getElementById('close-btn').onclick = () => {
                panel.classList.remove('expanded-objective');
                // Прозорецът автоматично се връща към оригиналните стилове от style.css (долу вдясно)
                // Ако искаш да се скрива напълно, откоментирай долния ред:
                // panel.style.display = "none";
            };
        }
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ НА ДАННИТЕ ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 
            data.forEach(item => {
                const marker = L.marker([item.lat, item.lon], { icon: getIntelIcon(item.type) }).addTo(markersLayer);
                marker.on('click', () => showIntelDetails(item));
                if (list) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry';
                    entry.innerHTML = `<small style="color:#39FF14;">[${item.date}]</small> <strong style="color:#fff;">${item.title}</strong>`;
                    entry.onclick = () => showIntelDetails(item);
                    list.appendChild(entry);
                }
            });
        });
    }

    syncIntel();
    setInterval(syncIntel, 60000);
};

// --- 8. UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/** END OF COMMAND SCRIPT v9.0 **/
