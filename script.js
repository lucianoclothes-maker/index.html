/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v14.0 - FINAL STABLE BUILD
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | СТАТУС: ПЪЛНА КОРЕКЦИЯ НА ЗОНИ И НАДПИСИ
 * -----------------------------------------------------------------------------
 * КОРЕКЦИИ:
 * 1. САЩ вече е в Tension Zone (проверка за USA и United States).
 * 2. Върнати надписи (Tooltips) с бяла рамка.
 * 3. Фиксиран 650px панел и звукова сигнализация.
 * =============================================================================
 */

window.onload = function() {
    
    let globalLastEventTitle = ""; 

    // --- СЕКЦИЯ 1: ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.1,
        wheelDebounceTime: 70
    }).setView([35.0, 40.0], 4.2); 

    const markersLayer = L.layerGroup().addTo(map);
    const militaryLayer = L.layerGroup().addToGroup ? L.layerGroup().addTo(map) : L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        crossOrigin: true
    }).addTo(map);

    // --- СЕКЦИЯ 2: ГЕОПОЛИТИЧЕСКИ ДАННИ (КОРЕКЦИЯ НА ИМЕНАТА) ---
    const warZones = ['Russia', 'Russian Federation', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq', 'Lebanon'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    const tensionZones = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'United States of America', 'United States', 'Turkey', 'Saudi Arabia'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
    .then(res => res.json())
    .then(geoData => {

        L.geoJson(geoData, {
            style: function(feature) {
                const n = feature.properties.name;
                
                // Цветово кодиране - САЩ ТУК СТАВА ОРАНЖЕВА
                if (warZones.includes(n)) return { fillColor:"#ff0000", weight:2.5, color:"#ff3131", fillOpacity:0.35, className:"war-border" };
                if (tensionZones.includes(n)) return { fillColor:"#ff8c00", weight:2.0, color:"#ff8c00", fillOpacity:0.25, className:"tension-glow" };
                if (blueZone.includes(n)) return { fillColor:"#0055ff", weight:2.0, color:"#00a2ff", fillOpacity:0.25 };
                
                return { fillColor:"#000", weight:0.6, color:"#333", fillOpacity:0.1 };
            },

            onEachFeature: function(feature, layer) {
                const n = feature.properties.name;

                // --- ВЪЗСТАНОВЯВАНЕ НА НАДПИСИТЕ (TOOLTIPS) ---
                layer.bindTooltip(`
                    <div style="
                        background: #000; 
                        color: #39FF14; 
                        border: 2px solid #ccc; 
                        padding: 6px 12px; 
                        font-family: 'Courier New', monospace; 
                        font-weight: bold;
                        font-size: 13px;
                        text-transform: uppercase;
                    ">
                        ${n}
                    </div>`, { 
                    sticky: true, 
                    direction: 'top', 
                    opacity: 1.0, 
                    offset: [0, -15] 
                });

                layer.on('mouseover', function() { this.setStyle({ fillOpacity:0.55, weight:3.5 }); });
                layer.on('mouseout', function() {
                    this.setStyle({
                        fillOpacity: warZones.includes(n) ? 0.35 : tensionZones.includes(n) ? 0.25 : 0.1,
                        weight: warZones.includes(n) ? 2.5 : 0.6
                    });
                });
            }
        }).addTo(map);
    });

    // --- СЕКЦИЯ 3: СТРАТЕГИЧЕСКИ АКТИВИ ---
    const strategicAssets = [
        { name:"US 5th Fleet HQ", type:"us-naval", lat:26.21, lon:50.60 },
        { name:"Al Udeid Air Base", type:"us-air", lat:25.11, lon:51.21 },
        { name:"Tehran Command", type:"ir-pvo", lat:35.68, lon:51.41 },
        { name:"Sevastopol Base", type:"ru-naval", lat:44.61, lon:33.53 },
        { name:"Incirlik NATO Base", type:"us-air", lat:37.00, lon:35.42 },
        { name:"Kaliningrad HQ", type:"ru-hq", lat:54.71, lon:20.45 }
    ];

    // --- СЕКЦИЯ 4: CSS СТИЛОВЕ (UI) ---
    const styleTag = document.createElement("style");
    styleTag.innerText = `
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; }
        .mil-icon-box { display:flex; align-items:center; justify-content:center; border-radius:50%; border:1px solid #fff; }
        .icon-us-nato { background:rgba(57,255,20,0.45); border-color:#39FF14; }
        .icon-ru-ua { background:rgba(255,0,0,0.45); border-color:#ff3131; }
        .alert-pulse { animation:alert-anim 2s infinite alternate; cursor:pointer; }
        @keyframes alert-anim { from{transform:scale(1);} to{transform:scale(1.3);} }
        .expanded-objective-panel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 650px !important;
            min-height: 520px !important; z-index: 99999 !important;
            background: rgba(5,5,5,0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 100px #000; font-family: monospace; display: flex; flex-direction: column;
        }
    `;
    document.head.appendChild(styleTag);

    // --- СЕКЦИЯ 5: ОБЕКТЕН ПАНЕЛ (650PX) ---
    const showObjectiveDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (!container || !content) return;

        container.classList.add('expanded-objective-panel');
        content.innerHTML = `
            <div style="background:#111; padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                <span style="color:#39FF14;">>> TACTICAL REPORT</span>
                <span id="close-objective" style="cursor:pointer; color:#ff3131; border:1px solid #ff3131; padding:2px 8px;">CLOSE [X]</span>
            </div>
            <div style="padding:40px; color:white;">
                <h1 style="color:#39FF14; font-size:28px;">${item.title.toUpperCase()}</h1>
                <p style="font-size:18px; color:#888;">Sector: ${item.country || 'Global'}</p>
                <p style="font-size:20px; line-height:1.6; margin-top:20px;">${item.description || 'Monitoring sector...'}</p>
            </div>`;
        document.getElementById('close-objective').onclick = () => container.classList.remove('expanded-objective-panel');
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- СЕКЦИЯ 6: СИНХРОНИЗАЦИЯ И ЗВУК ---
    function syncTacticalData() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            if (!Array.isArray(data)) return;
            markersLayer.clearLayers();
            if (data.length > 0 && data[0].title !== globalLastEventTitle) {
                if (data[0].critical === true) { new Audio('alert.mp3').play().catch(() => {}); }
                globalLastEventTitle = data[0].title;
            }
            data.forEach(item => {
                const marker = L.marker([item.lat, item.lon], {
                    icon: L.divIcon({ html: `<div class="alert-pulse" style="font-size:35px;">🚨</div>`, iconSize:[40,40] })
                }).addTo(markersLayer);
                marker.on('click', () => showObjectiveDetails(item));
            });
        });
    }

    // --- СЕКЦИЯ 7: ИКОНИ И БАЗИ ---
    function createAssetIcon(type) {
        let cls = type.includes('us-') ? 'icon-us-nato' : 'icon-ru-ua';
        return L.divIcon({ html:`<div class="mil-icon-box ${cls}" style="width:30px;height:30px;">⚓</div>`, iconSize:[30,30] });
    }

    strategicAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], {icon:createAssetIcon(asset.type)}).addTo(militaryLayer).bindTooltip(asset.name);
    });

    syncTacticalData();
    setInterval(syncTacticalData, 60000);
};

// --- СЕКЦИЯ 8: СИСТЕМЕН ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/**
 * =============================================================================
 * ФИНАЛЕН ЛОГ: ВЕРСИЯ 14.0 ЗАРЕДЕНА.
 * САЩ: ОРАНЖЕВА | НАДПИСИ: АКТИВНИ | ПАНЕЛ: 650PX.
 * =============================================================================
 */
