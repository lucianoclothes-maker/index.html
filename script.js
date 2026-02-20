window.onload = function() {
    const alertSound = new Audio('alert.mp3');
    let previousEventCount = 0; 
    let allConflictData = [];
    let markersLayer = L.layerGroup();

    // --- ИНИЦИАЛИЗИРАНЕ НА КАРТАТА ---
    var map = L.map('map', { 
        worldCopyJump: true, 
        minZoom: 2 
    }).setView([48.0, 37.0], 6); // Фокус върху Източна Украйна

    markersLayer.addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.5, pane: 'shadowPane'
    }).addTo(map);

    // --- НОВИ "LIVEUAMAP" СТИЛ ИКОНИ (КРЪГЛИ) ---
    const createLiveIcon = (svgPath, bgColor) => {
        return L.divIcon({
            html: `<div class="live-icon-container" style="background-color: ${bgColor};">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                        ${svgPath}
                    </svg>
                   </div>`,
            className: '', iconSize: [26, 26], iconAnchor: [13, 13]
        });
    };

    // SVG Пътеки за иконите
    const paths = {
        clash: '<path d="M21 7L17 3L13.5 6.5L14.5 7.5L11 11L9 9L3 15L5 17L9 13L11 15L15.5 10.5L16.5 11.5L21 7Z"/>', // Кръстосани мечове/автомат стил
        explosion: '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>',
        ship: '<path d="M20 18L18 20H6L4 18V17H20V18ZM19 13L17 15H7L5 13V10H19V13ZM12 2L15 8H9L12 2Z"/>',
        missile: '<path d="M13.31 11.05L19.67 4.69L17.55 2.56L11.19 8.92L8.36 8.22L2 14.59L5.54 18.12L2.71 20.95L3.41 21.66L6.24 18.83L9.77 22.36L16.14 16L15.44 13.17L13.31 11.05Z"/>'
    };

    const iconClash = createLiveIcon(paths.clash, '#e74c3c'); // Червено за боеве
    const iconExplosion = createLiveIcon(paths.explosion, '#f39c12'); // Оранжево за взривове
    const iconNaval = createLiveIcon(paths.ship, '#3498db'); // Синьо за море
    const iconMissile = createLiveIcon(paths.missile, '#8e44ad'); // Лилаво за ракети

function getTacticalIcon(type, title) {
        const t = title.toLowerCase();
        
        // 1. Проверка за ракети и дронове (Лилаво)
        if (t.includes('missile') || t.includes('ракет') || t.includes('drone') || t.includes('дрон') || t.includes('uav')) {
            return iconMissile;
        }
        
        // 2. Проверка за кораби (Синьо)
        if (type === 'Naval' || t.includes('ship') || t.includes('кораб') || t.includes('boat')) {
            return iconNaval;
        }
        
        // 3. Проверка за експлозии и удари (Оранжево)
        if (type === 'Explosion' || type === 'Airstrike' || t.includes('strike') || t.includes('удар') || t.includes('взрив')) {
            return iconExplosion;
        }
        
        // 4. Всичко останало - автоматично червено за боеве
        return iconClash;
    }

    // --- ВОЕННА СИТУАЦИЯ В УКРАЙНА (ДЕТАЙЛНА) ---
    
    // 1. Окупирана зона (DeepState стил)
    var occupiedArea = [
        [46.1, 32.9], [44.4, 33.5], [44.5, 34.2], [45.4, 36.5], 
        [47.1, 37.6], [48.1, 39.5], [49.6, 40.1], [50.2, 38.5], 
        [49.0, 38.5], [47.0, 35.0], [46.1, 32.9]
    ];
    L.polygon(occupiedArea, { 
        color: '#ff0000', weight: 1, fillColor: '#ff0000', fillOpacity: 0.25 
    }).addTo(map).bindTooltip("Окупирани територии", {sticky: true, className: 'zone-label'});

    // 2. Фронтова линия (По-агресивна)
    var frontLine = [
        [46.5, 32.3], [46.7, 33.4], [47.4, 35.4], [47.8, 36.5],
        [48.0, 37.6], [48.6, 38.0], [49.5, 38.1], [50.1, 37.8]
    ];
    L.polyline(frontLine, { color: '#ff0000', weight: 3, opacity: 0.9, dashArray: '5, 8' }).addTo(map);

    // 3. Постоянни надписи за градове и направления
    const addFrontLabel = (coords, text) => {
        L.marker(coords, { 
            icon: L.divIcon({ className: 'front-text-label', html: text, iconSize: [100, 20] }) 
        }).addTo(map);
    };
    addFrontLabel([48.2, 37.2], "ПОКРОВСК");
    addFrontLabel([49.4, 37.6], "КУПЯНСК");
    addFrontLabel([46.6, 32.6], "ХЕРСОН");

    // --- ОСНОВНА ФУНКЦИЯ ЗА ДАННИТЕ ---
    function loadMapData() {
        fetch('conflicts.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                if (previousEventCount !== 0 && data.length > previousEventCount) {
                    const latest = data[0]; 
                    const criticalKeywords = ['missile', 'rocket', 'nuclear', 'explosion', 'strike', 'ракет', 'удар', 'взрив'];
                    if (criticalKeywords.some(word => latest.title.toLowerCase().includes(word))) {
                        alertSound.play().catch(e => {});
                    }
                }
                previousEventCount = data.length;
                allConflictData = data;
                markersLayer.clearLayers(); 
                
                data.forEach(p => {
                    let marker = L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.type, p.title) });
                    marker.addTo(markersLayer);
                    
                    marker.on('click', () => {
                        map.setView([p.lat, p.lon], 7);
                        document.getElementById('news-content').innerHTML = `
                            <div class="news-card">
                                <h3>${p.country}</h3>
                                <p>${p.title}</p>
                                <a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a>
                            </div>`;
                    });
                });

                document.getElementById('active-events').innerText = "Активни събития: " + data.length;
                document.getElementById('news-ticker').innerText = data.map(p => `[${p.country.toUpperCase()}: ${p.title}]`).join(' +++ ');
            });
    }

    loadMapData();
    setInterval(loadMapData, 60000);

    // --- ТЪРСЕНЕ ---
    const searchInput = document.getElementById('map-search');
    const resultsDiv = document.getElementById('search-results');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            resultsDiv.innerHTML = '';
            if (term.length < 2) { resultsDiv.style.display = 'none'; return; }
            const matches = allConflictData.filter(p => p.country.toLowerCase().includes(term) || p.title.toLowerCase().includes(term));
            if (matches.length > 0) {
                resultsDiv.style.display = 'block';
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerText = match.title;
                    div.onclick = () => { map.flyTo([match.lat, match.lon], 8); resultsDiv.style.display = 'none'; };
                    resultsDiv.appendChild(div);
                });
            }
        });
    }
};

setInterval(() => {
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.getUTCHours().toString().padStart(2, '0') + ":" + 
                          now.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                          now.getUTCSeconds().toString().padStart(2, '0') + " UTC";
    }
}, 1000);
