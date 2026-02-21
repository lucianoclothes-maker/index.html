/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v12.7 - MAX-CONTENT EXTENSION
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | СТАТУС: ПЪЛНА СЪВМЕСТИМОСТ С BOT.PY
 * -----------------------------------------------------------------------------
 * КОРЕКЦИИ: 
 * 1. Запазен оригинален стил на v12.5
 * 2. Добавена пълна база данни за ПВО и бази (разширена)
 * 3. Внедрена логика за звук alert.mp3 при нови събития
 * 4. Увеличен размер на детайлния панел (800px)
 * 5. Стриктно спазване на дължината на кода (250 реда)
 * =============================================================================
 */

window.onload = function() {
    
    // Памет за последното заглавие, за да не свири алармата постоянно
    let internalLastEventTitle = ""; 

    // --- 1. КАРТА И СЛОЕВЕ (ОСНОВА) ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5,
        fadeAnimation: true
    }).setView([32.0, 45.0], 4.5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    // Тъмна тактическа подложка
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, 
        minZoom: 2, 
        crossOrigin: true
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ (Всичко запазено от твоя код) ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq'];
    
    // Европа остава СИНЯ (ALLY SECTOR)
    const blueZone = [
        'France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 
        'Spain', 'Bulgaria', 'Romania', 'Greece', 'Norway', 'Belgium', 'Netherlands'
    ];

    // Зони с високо напрежение
    const highTension = [
        'Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 
        'United States', 'United States of America', 'USA', 'Turkey', 'Saudi Arabia'
    ];

    // Зареждане на границите и добавяне на интерактивни Tooltips
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
                    let label = n.toUpperCase();
                    let sColor = "#39FF14"; 

                    if (warZones.includes(n)) { 
                        label += `<br><span style="color:#ff3131; font-size:10px;">WAR ZONE</span>`; 
                        sColor = "#ff3131"; 
                    } else if (blueZone.includes(n)) { 
                        label += `<br><span style="color:#00a2ff; font-size:10px;">ALLY SECTOR</span>`; 
                        sColor = "#00a2ff"; 
                    } else if (highTension.includes(n)) { 
                        label += `<br><span style="color:#ff8c00; font-size:10px;">HIGH TENSION</span>`; 
                        sColor = "#ff8c00"; 
                    }

                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid ${sColor}; padding:6px; font-family:monospace; box-shadow: 0 0 10px ${sColor};">${label}</div>`, { sticky: true });
                    
                    // Реакция при Hover
                    l.on('mouseover', function() { this.setStyle({ fillOpacity: 0.45 }); });
                    l.on('mouseout', function() { this.setStyle({ fillOpacity: 0.25 }); });
                }
            }).addTo(map);
        });

    // --- 3. РАЗШИРЕН СПИСЪК АСЕТИ (САЩ, ИРАН, УКРАЙНА, РУСИЯ) ---
    const assets = [
        // --- Близък Изток: САЩ ---
        { name: "Fifth Fleet HQ (US)", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base (US)", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Al Dhafra Base (US)", type: "us-airbase", lat: 24.24, lon: 54.54 },
        { name: "Camp Arifjan (US)", type: "us-hq", lat: 28.87, lon: 48.15 },
        { name: "Incirlik Air Base (NATO)", type: "us-airbase", lat: 37.00, lon: 35.42 },

        // --- Близък Изток: Иран ---
        { name: "Tehran Air Defense HQ", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Isfahan Airbase (IRIAF)", type: "ir-airbase", lat: 32.75, lon: 51.86 },
        { name: "Bandar Abbas Naval", type: "ir-naval", lat: 27.14, lon: 56.21 },
        { name: "Bushehr Defense System", type: "ir-pvo", lat: 28.82, lon: 50.88 },
        { name: "Fordow Strategic Site", type: "ir-hq", lat: 34.33, lon: 50.93 },

        // --- Източна Европа ---
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72 },
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99 },
        { name: "Kyiv Command Center", type: "ua-hq", lat: 50.45, lon: 30.52 },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21 },
        { name: "Black Sea Fleet HQ", type: "naval-ru", lat: 44.59, lon: 33.52 }
    ];

    // --- 4. ДИНАМИЧЕН CSS (УВЕЛИЧЕН МОДАЛ) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 12px rgba(0,0,0,0.7); }
        .icon-us { background: rgba(57, 255, 20, 0.5); border-color: #39FF14; color: #fff; }
        .icon-ir { background: rgba(255, 140, 0, 0.5); border-color: #ff8c00; color: #fff; }
        .icon-ua { background: rgba(52, 152, 219, 0.7); border-color: #fff; } 
        .icon-ru { background: rgba(231, 76, 60, 0.7); border-color: #fff; }
        
        /* ПУЛСАЦИЯ ЗА НОВИНИ */
        .pulse-intel { animation: pulse-anim 1.8s infinite alternate; cursor: pointer; filter: drop-shadow(0 0 10px #ff3131); }
        @keyframes pulse-anim { from { transform: scale(1); opacity: 1; } to { transform: scale(1.3); opacity: 0.6; } }
        
        /* ГОЛЯМ ТАКТИЧЕСКИ ПРОЗОРЕЦ (800PX) */
        .expanded-intel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 800px !important;
            min-height: 520px !important; z-index: 20000 !important;
            background: rgba(5, 5, 5, 0.98) !important; border: 3px solid #39FF14 !important;
            box-shadow: 0 0 200px #000; padding: 0 !important; display: flex; flex-direction: column;
        }
        .intel-entry { border-left: 4px solid #39FF14; padding: 15px; margin-bottom: 10px; cursor: pointer; background: rgba(255,255,255,0.04); transition: 0.3s; }
        .intel-entry:hover { background: rgba(57, 255, 20, 0.1); }
        .close-trigger { cursor: pointer; color: #ff3131; border: 1px solid #ff3131; padding: 6px 18px; font-weight: bold; font-family: monospace; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ЛОГИКА ЗА ТАКТИЧЕСКИ ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        
        if (type.startsWith('us-')) {
            cls += 'icon-us';
            if (type.includes('naval')) sym = '⚓';
            else if (type.includes('hq')) sym = '🏢';
            else if (type.includes('airbase')) sym = '🦅';
        } else if (type.startsWith('ir-')) {
            cls += 'icon-ir';
            if (type.includes('pvo')) sym = '📡';
            else if (type.includes('naval')) sym = '🚢';
            else if (type.includes('hq')) sym = '☢️';
            else if (type.includes('airbase')) sym = '🛫';
        } else {
            if (type.includes('ua')) cls += 'icon-ua'; else cls += 'icon-ru';
            if (type.includes('naval')) sym = '⚓';
        }

        return L.divIcon({ 
            html: `<div class="${cls}" style="font-size:18px; width:34px; height:34px;">${sym}</div>`, 
            className: '', 
            iconSize: [34, 34] 
        });
    }

    // Рендериране на статичните обекти
    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ (УГОЛЕМЕН) ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (container && content) {
            container.classList.add('expanded-intel');
            content.innerHTML = `
                <div style="background:rgba(57,255,20,0.2); padding:18px; border-bottom:2px solid #333; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#39FF14; font-weight:bold; letter-spacing:2px; font-family:monospace;">>> TACTICAL INTEL REPORT</span>
                    <span id="close-intel-btn" class="close-trigger">EXIT SYSTEM [X]</span>
                </div>
                <div style="padding:45px; color:white; font-family:monospace;">
                    <h1 style="color:#39FF14; margin-top:0; font-size:36px; border-bottom:1px solid #333; padding-bottom:15px;">${item.title.toUpperCase()}</h1>
                    <p style="font-size:22px; line-height:1.6; color:#ddd;">Sector: ${item.country || "Unknown"}<br><br>${item.description || "Intelligence stream active. Monitoring ongoing operations."}</p>
                    <div style="background:rgba(255,0,0,0.15); padding:20px; border-left:6px solid #ff3131; margin:30px 0;">
                        <strong style="font-size:20px;">THREAT LEVEL:</strong> <span style="color:#ff3131; font-size:20px;">CRITICAL</span><br>
                        <strong>COORDINATES:</strong> ${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}
                    </div>
                    <a href="${item.link || "#"}" target="_blank" style="display:block; background:#39FF14; color:#000; padding:18px; text-align:center; font-weight:bold; text-decoration:none; font-size:20px;">SECURE SOURCE ACCESS</a>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ И ЗВУК (alert.mp3) ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            if (!Array.isArray(data)) return;
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 

            // ПРОВЕРКА ЗА ЗВУК ПРИ НОВА КРИТИЧНА НОВИНА
            if (data.length > 0 && data[0].title !== internalLastEventTitle) {
                if (data[0].type === "Evacuation" || data[0].critical === true) {
                    const alertAudio = new Audio('alert.mp3');
                    alertAudio.play().catch(err => console.log("Audio waiting for interaction."));
                }
                internalLastEventTitle = data[0].title;
            }

            data.forEach(item => {
                const sym = item.type.includes('missile') || item.critical ? '🚀' : '🚨';
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="pulse-intel" style="font-size:38px;">${sym}</div>`, className: '', iconSize:[45,45] }) 
                }).addTo(markersLayer);
                
                marker.on('click', () => openIntelDetails(item));
                
                if (list) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry';
                    entry.innerHTML = `<small style="color:#888; font-family:monospace;">[${item.date}]</small> <br> <strong style="color:#39FF14; font-size:16px;">${item.title}</strong>`;
                    entry.onclick = () => openIntelDetails(item);
                    list.appendChild(entry);
                }
            });
        });
    }

    // Стартиране на циклите
    syncIntel(); 
    setInterval(syncIntel, 60000);
};

// --- 8. UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) {
        const now = new Date();
        el.innerText = now.toUTCString().split(' ')[4] + " UTC";
    }
}, 1000);

/** * КРАЙ НА СИСТЕМНИЯ СКРИПТ v12.7
 * СИСТЕМАТА Е ОПТИМИЗИРАНА ЗА BORISLAV
 */
