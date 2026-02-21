/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v13.0 - NEWS INTEGRATION & BREAKING ALERTS
 * =============================================================================
 * НОВО: Интеграция на новини за евакуация (Германия -> Иран).
 * ОБЕКТ: Пулсиращи маркери за "Breaking News" събития.
 * СТАТУС: Местоположение - България. Дата: 21.02.2026.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. КАРТА (Фокус върху зоните на интерес) ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5
    }).setView([35.0, 40.0], 4); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2, crossOrigin: true
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ (Всичко запазено от скрийншотите) ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const blueZone = ['France', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    
    // Германия остава в High Tension заради новите събития
    const highTension = [
        'Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 
        'United States', 'United States of America', 'USA', 'Turkey', 'Germany'
    ];

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
                    let sColor = highTension.includes(n) ? "#ff8c00" : (blueZone.includes(n) ? "#00a2ff" : "#39FF14");
                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid ${sColor}; padding:5px;"><strong>${n.toUpperCase()}</strong></div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. СТРАТЕГИЧЕСКИ АСЕТИ ---
    const assets = [
        { name: "Al Udeid Air Base (US)", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Tehran Air Defense (PVO)", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72 },
        { name: "Fifth Fleet HQ (US)", type: "us-naval", lat: 26.21, lon: 50.60 }
    ];

    // --- 4. CSS ЗА BREAKING NEWS И ИКОНИ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; }
        .icon-us { background: rgba(57, 255, 20, 0.4); border-color: #39FF14; }
        .icon-ir { background: rgba(255, 140, 0, 0.4); border-color: #ff8c00; }
        .pulse-breaking { animation: pulse-yellow 1.5s infinite; border-radius: 50%; background: rgba(255, 49, 49, 0.4); }
        @keyframes pulse-yellow { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 49, 49, 0.7); } 70% { transform: scale(1.3); box-shadow: 0 0 0 15px rgba(255, 49, 49, 0); } 100% { transform: scale(1); } }
        .intel-entry-breaking { border-left: 3px solid #ff3131 !important; background: rgba(255, 0, 0, 0.1) !important; color: #ff3131 !important; }
        .expanded-intel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 620px !important;
            background: rgba(10, 10, 10, 0.99) !important; border: 2px solid #ff3131 !important;
            z-index: 10000 !important; box-shadow: 0 0 100px #000;
        }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИИ ЗА ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.startsWith('us-')) { cls += 'icon-us'; sym = type.includes('naval') ? '⚓' : '🦅'; }
        else if (type.startsWith('ir-')) { cls += 'icon-ir'; sym = type.includes('pvo') ? '📡' : '🏢'; }
        else { cls += type.includes('ua') ? 'icon-ua' : 'icon-ru'; }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:16px; width:30px; height:30px;">${sym}</div>`, className: '', iconSize: [30, 30] });
    }

    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ ЗА BREAKING NEWS ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (container && content) {
            container.classList.add('expanded-intel');
            content.innerHTML = `
                <div style="background:rgba(255,49,49,0.2); padding:10px; border-bottom:1px solid #ff3131; display:flex; justify-content:space-between;">
                    <span style="color:#ff3131; font-weight:bold;">🚨 BREAKING INTEL</span>
                    <span id="close-intel-btn" style="cursor:pointer; color:#ff3131;">[CLOSE X]</span>
                </div>
                <div style="padding:25px; color:white;">
                    <h2 style="color:#ff3131; margin-top:0;">${item.title.toUpperCase()}</h2>
                    <p style="font-size:18px; line-height:1.6;">${item.description}</p>
                    <div style="background:rgba(255,255,255,0.05); padding:15px; margin-top:20px; border:1px solid #444;">
                        <strong>SOURCE:</strong> DIPLOMATIC CHANNELS | <strong>STATUS:</strong> URGENT
                    </div>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 6);
    };

    // --- 7. СИНХРОНИЗАЦИЯ НА НОВИНИТЕ (BREAKING NEWS LOGIC) ---
    function syncIntel() {
        const list = document.getElementById('intel-list');
        if (!list) return;
        
        // Симулираме данни, включващи новината за Германия и Иран
        const breakingNews = [
            {
                date: "2026-02-21 14:20",
                title: "GERMANY EVACUATION ORDER",
                description: "Germany declares its citizens must evacuate Iran immediately due to rising tensions.",
                lat: 32.42, lon: 53.68, // Центрирано над Иран
                type: "breaking"
            }
        ];

        markersLayer.clearLayers();
        list.innerHTML = ''; 

        breakingNews.forEach(item => {
            // Създаваме пулсиращ маркер на картата
            const marker = L.marker([item.lat, item.lon], { 
                icon: L.divIcon({ html: `<div class="pulse-breaking" style="font-size:24px; text-align:center;">❗</div>`, className: '', iconSize:[40,40] }) 
            }).addTo(markersLayer);
            
            marker.on('click', () => openIntelDetails(item));

            // Добавяме в Live Intel Update списъка
            const entry = document.createElement('div');
            entry.className = 'intel-entry-breaking';
            entry.style = "padding:10px; margin-bottom:8px; border-left:3px solid #ff3131; cursor:pointer; font-family:monospace;";
            entry.innerHTML = `<small>[${item.date}]</small><br><strong>${item.title}</strong>`;
            entry.onclick = () => openIntelDetails(item);
            list.appendChild(entry);
        });
    }

    syncIntel(); 
    // За по-реалистично, тук може да добавиш и нормалните новини от conflicts.json
};

// --- 8. UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
