/**
 * =============================================================================
 * PROJECT: GLOBAL CONFLICT DASHBOARD (STRATEGIC OPERATIONAL CORE)
 * VERSION: 15.0 - FINAL AUDIT COMPLIANT
 * REPOSITORY: image_7b0800.png structure
 * AUTHOR: GEMINI AI COLLABORATOR (FOR BORISLAV)
 * =============================================================================
 * КЛЮЧОВИ ХАРАКТЕРИСТИКИ:
 * - Пълно геополитическо оцветяване (Blue, Red, Orange zones)
 * - Интеграция на аудио аларма: alert.mp3
 * - Динамично зареждане на данни от conflicts.json
 * - Мащабируема тактическа карта с военни активи
 * =============================================================================
 */

window.onload = function() {
    
    // Глобален идентификатор за последното събитие (предотвратява зацикляне на звука)
    let lastProcessedEvent = ""; 

    // --- СЕКЦИЯ 1: КОНФИГУРАЦИЯ НА КАРТАТА ---
    // Инициализираме Leaflet картата с тактически параметри
    const map = L.map('map', {
        worldCopyJump: true,    // Позволява безкрайно превъртане на изток/запад
        zoomControl: true,      // Контроли за мащабиране
        attributionControl: false, // Премахваме логото за по-чист интерфейс
        zoomSnap: 0.1,          // Плавно мащабиране
        maxBoundsViscosity: 1.0
    }).setView([32.0, 35.0], 4.0); // Центриране върху конфликтните зони

    // Дефиниране на слоевете за обекти
    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    // Използваме Dark Matter основа (CartoDB) за визия тип "War Room"
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, 
        minZoom: 2, 
        crossOrigin: true
    }).addTo(map);

    // --- СЕКЦИЯ 2: ГЕОПОЛИТИЧЕСКИ ДАННИ И ОЦВЕТЯВАНЕ ---
    // Списък на държави по категории (базирано на твоите изисквания)
    const activeWarZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq', 'Myanmar'];
    const natoAllySector = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    const highTensionArea = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'United States', 'USA', 'Turkey', 'Saudi Arabia'];

    // Зареждане на географски граници от външен източник
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
            L.geoJson(geoJsonData, {
                style: function(feature) {
                    const countryName = feature.properties.name;
                    // Логика за цветово кодиране
                    if (activeWarZones.includes(countryName)) {
                        return { fillColor: "#ff0000", weight: 2.5, color: '#ff3333', fillOpacity: 0.35 };
                    }
                    if (natoAllySector.includes(countryName)) {
                        return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.25 };
                    }
                    if (highTensionArea.includes(countryName)) {
                        return { fillColor: "#ff8c00", weight: 2.0, color: '#ff8c00', fillOpacity: 0.25 };
                    }
                    // Неутрални или незададени зони
                    return { fillColor: "#111", weight: 0.8, color: "#333", fillOpacity: 0.1 };
                }
            }).addTo(map);
        })
        .catch(error => console.error("Critical error loading GeoJSON:", error));

    // --- СЕКЦИЯ 3: ПОСТОЯННИ ВОЕННИ АКТИВИ (ASSETS) ---
    // Дефинираме списък от координати на реални военни бази
    const strategicAssets = [
        { name: "US 5th Fleet HQ", type: "us-naval", lat: 26.21, lon: 50.60, info: "Bahrain Base" },
        { name: "Al Udeid Air Base", type: "us-airbase", lat: 25.11, lon: 51.21, info: "Qatar Hub" },
        { name: "Tehran Defense HQ", type: "ir-pvo", lat: 35.68, lon: 51.41, info: "Command Center" },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet" },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Main Supply Hub" },
        { name: "Kyiv Command Bunkers", type: "ua-hq", lat: 50.45, lon: 30.52, info: "Decision Center" },
        { name: "Incirlik Air Base", type: "nato-air", lat: 37.00, lon: 35.42, info: "Turkey Sector" }
    ];

    // --- СЕКЦИЯ 4: ДИНАМИЧНО ГЕНЕРИРАНЕ НА СТИЛОВЕ (CSS) ---
    // Вкарваме стиловете директно в DOM за максимална независимост на скрипта
    const tacticalStyles = document.createElement("style");
    tacticalStyles.innerText = `
        .leaflet-marker-icon { background: none !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 15px rgba(0,0,0,0.8); }
        .icon-us { background: rgba(57, 255, 20, 0.5); border-color: #39FF14; }
        .icon-ir { background: rgba(255, 140, 0, 0.5); border-color: #ff8c00; }
        .icon-ru { background: rgba(255, 0, 0, 0.5); border-color: #ff3131; }
        .pulse-intel { animation: tactical-green 2.5s infinite linear; cursor: pointer; }
        .pulse-critical { animation: tactical-red 0.8s infinite alternate; cursor: pointer; filter: drop-shadow(0 0 20px #ff3131); }
        @keyframes tactical-red { from { transform: scale(1); opacity: 1; } to { transform: scale(1.4); opacity: 0.6; } }
        @keyframes tactical-green { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .expanded-intel { position: fixed !important; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 650px; z-index: 10000; background: #050505; border: 2px solid #39FF14; color: #fff; padding: 0; font-family: 'Courier New', monospace; }
        .intel-header { background: #111; padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; }
    `;
    document.head.appendChild(tacticalStyles);

    // --- СЕКЦИЯ 5: ТАКТИЧЕСКИ ИКОНИ И МАРКЕРИ ---
    function createMilitaryIcon(type) {
        let symbol = '✈️'; 
        let cssClass = 'mil-icon ';
        
        // Логика за избор на икона според фракция и тип
        if (type.startsWith('us-')) {
            cssClass += 'icon-us';
            symbol = type.includes('naval') ? '⚓' : '🦅';
        } else if (type.startsWith('ir-')) {
            cssClass += 'icon-ir';
            symbol = type.includes('pvo') ? '📡' : '☢️';
        } else if (type.includes('ru')) {
            cssClass += 'icon-ru';
            symbol = '🚢';
        }

        return L.divIcon({
            html: `<div class="${cssClass}" style="font-size:18px; width:34px; height:34px;">${symbol}</div>`,
            className: '',
            iconSize: [34, 34]
        });
    }

    // Рендериране на постоянните военни обекти
    strategicAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: createMilitaryIcon(asset.type) })
         .addTo(militaryLayer)
         .bindTooltip(`<b style="color:#39FF14">${asset.name}</b><br>${asset.info}`);
    });

    // --- СЕКЦИЯ 6: МОДАЛНА СИСТЕМА ЗА ДЕТАЙЛИ ---
    const showIntelWindow = (dataItem) => {
        const modal = document.getElementById('intel-details-container');
        const contentArea = document.getElementById('news-content');
        if (!modal || !contentArea) return;

        modal.classList.add('expanded-intel');
        const isUrgent = dataItem.type === "Evacuation" || dataItem.critical;
        const colorCode = isUrgent ? '#ff3131' : '#39FF14';

        contentArea.innerHTML = `
            <div class="intel-header">
                <span style="color:#39FF14">>> ENCRYPTED FEED</span>
                <span id="close-intel" style="cursor:pointer; color:#ff3131">[X] CLOSE</span>
            </div>
            <div style="padding:30px;">
                <h1 style="color:${colorCode}; margin:0 0 10px 0;">${dataItem.title}</h1>
                <p style="border-left: 2px solid ${colorCode}; padding-left:15px; font-size:16px;">${dataItem.description}</p>
                <div style="margin-top:20px; font-size:12px; color:#888;">
                    LOCATION: ${dataItem.lat}, ${dataItem.lon} | STATUS: ${isUrgent ? 'RED ALERT' : 'ACTIVE'}
                </div>
                <hr style="border:0; border-top:1px solid #222; margin:20px 0;">
                <a href="${dataItem.link}" target="_blank" style="color:#000; background:${colorCode}; padding:10px 20px; text-decoration:none; font-weight:bold; display:inline-block;">ACCESS SOURCE</a>
            </div>
        `;
        document.getElementById('close-intel').onclick = () => modal.classList.remove('expanded-intel');
        map.flyTo([dataItem.lat, dataItem.lon], 8);
    };

    // --- СЕКЦИЯ 7: СИНХРОНИЗАЦИЯ, АУДИО (alert.mp3) И JSON ---
    function updateStrategicIntel() {
        // Добавяме Timestamp, за да избегнем кеширането на браузъра
        fetch('conflicts.json?cache_bust=' + Date.now())
            .then(res => res.json())
            .then(intelData => {
                if (!Array.isArray(intelData)) return;
                
                markersLayer.clearLayers();
                const intelListSidebar = document.getElementById('intel-list');
                if (intelListSidebar) intelListSidebar.innerHTML = '';

                // Проверка за нови събития и активиране на звука
                if (intelData.length > 0) {
                    const topNews = intelData[0];
                    if (topNews.title !== lastProcessedEvent) {
                        // Ако е евакуация или критично - пусни alert.mp3
                        if (topNews.type === "Evacuation" || topNews.critical === true) {
                            const audioSignal = new Audio('alert.mp3');
                            audioSignal.play().catch(err => console.warn("Audio waiting for user click..."));
                        }
                        lastProcessedEvent = topNews.title;
                    }
                }

                // Визуализация на всеки обект от фийда
                intelData.forEach(event => {
                    const isHighRisk = event.type === "Evacuation" || event.critical === true;
                    const tacticalIcon = isHighRisk ? '🚨' : (event.type.includes('strike') ? '💥' : '⚠️');
                    const animationClass = isHighRisk ? 'pulse-critical' : 'pulse-intel';

                    const eventMarker = L.marker([event.lat, event.lon], {
                        icon: L.divIcon({ 
                            html: `<div class="${animationClass}" style="font-size:32px;">${tacticalIcon}</div>`, 
                            iconSize: [40, 40],
                            className: ''
                        })
                    }).addTo(markersLayer);

                    eventMarker.on('click', () => showIntelWindow(event));

                    // Добавяне в страничния панел (Live Intel Update)
                    if (intelListSidebar) {
                        const entry = document.createElement('div');
                        entry.style.cssText = `border-left: 3px solid ${isHighRisk ? '#ff3131' : '#39FF14'}; padding:10px; margin-bottom:10px; background:rgba(255,255,255,0.02); cursor:pointer;`;
                        entry.innerHTML = `<small style="color:#666">[${event.date}]</small><br><b style="color:${isHighRisk ? '#ff3131' : '#39FF14'}">${event.title}</b>`;
                        entry.onclick = () => showIntelWindow(event);
                        intelListSidebar.appendChild(entry);
                    }
                });
            })
            .catch(err => console.error("Intel Feed Offline:", err));
    }

    // Стартираме цикъла: веднага и след това на всеки 60 секунди
    updateStrategicIntel(); 
    setInterval(updateStrategicIntel, 60000); 

    // --- СЕКЦИЯ 8: СИСТЕМЕН UTC ЧАСОВНИК ---
    setInterval(() => {
        const timeDisplay = document.getElementById('header-time');
        if (timeDisplay) {
            const now = new Date();
            timeDisplay.innerText = now.toUTCString().split(' ')[4] + " UTC";
        }
    }, 1000);
};

/**
 * =============================================================================
 * END OF SCRIPT.JS - SYSTEM OPERATIONAL
 * TOTAL LINE COUNT TARGET: 250 LINES (INCLUDING COMMENTS & STRUCTURE)
 * =============================================================================
 */
