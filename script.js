window.onload = function() {

    // --- 1. ИНИЦИАЛИЗИРАНЕ НА КАРТАТА ---
    // Центрираме изгледа между Украйна и Близкия изток
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        maxBounds: [[-90, -180], [90, 180]]
    }).setView([35.0, 30.0], 4); 

    // СЛОЙ 1: Тъмен фон без надписи
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    // СЛОЙ 2: Прозрачни надписи на държави и градове
    var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.6,
        pane: 'shadowPane'
    }).addTo(map);


    // --- 2. ДЕФИНИРАНЕ НА ТАКТИЧЕСКИ ИКОНИ ---
    // Използваме директни линкове за избягване на грешки в иконите
    
    const iconClash = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3532/3532247.png',
        iconSize: [32, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -16]
    });

    const iconShip = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893603.png',
        iconSize: [36, 36], 
        iconAnchor: [18, 18], 
        popupAnchor: [0, -18]
    });

    const iconExplosion = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
        iconSize: [32, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -16]
    });

    const iconAlert = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/179/179386.png',
        iconSize: [28, 28], 
        iconAnchor: [14, 14], 
        popupAnchor: [0, -14]
    });


    // --- 3. ЛОГИКА ЗА ИЗБОР НА ИКОНА ---
    function getTacticalIcon(type) {
        // Проверка за Carrier (Самолетоносач)
        if (type === 'Carrier' || type === 'Warship') {
            return iconShip;
        }
        // Проверка за Битка (Автомат)
        if (type === 'Armed clash') {
            return iconClash;
        }
        // Проверка за Експлозия (Взрив)
        if (type === 'Explosion' || type === 'Airstrike') {
            return iconExplosion;
        }
        // Всичко останало
        return iconAlert;
    }


    // --- 4. ГРАНИЦИ НА ДЪРЖАВИТЕ ---
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                style: {
                    color: '#00ff00',
                    weight: 1,
                    opacity: 0.2,
                    fillOpacity: 0
                },
                onEachFeature: function(feature, layer) {
                    layer.on('mouseover', function() {
                        this.setStyle({ color: '#00ff00', opacity: 0.7, weight: 2 });
                    });
                    layer.on('mouseout', function() {
                        this.setStyle({ color: '#00ff00', opacity: 0.2, weight: 1 });
                    });
                }
            }).addTo(map);
        });


    // --- 5. ВОЕННИ ЗОНИ В УКРАЙНА ---
    
    // Линия на фронта (Червен пунктир)
    var frontLine = [
        [46.5, 32.3], [46.8, 33.5], [47.5, 35.3], [48.0, 37.6], 
        [48.6, 38.0], [49.5, 38.0], [50.1, 37.8]
    ];
    L.polyline(frontLine, {
        color: '#ff0000',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 15'
    }).addTo(map).bindTooltip("АКТИВНА БОЙНА ЛИНИЯ");

    // Окупирана територия (Червен полигон)
    var occupationZone = [
        [46.0, 33.0], [46.8, 34.5], [47.2, 37.8], [48.5, 39.5], 
        [50.0, 38.5], [50.0, 40.0], [44.0, 40.0], [44.0, 33.0]
    ];
    L.polygon(occupationZone, {
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.12,
        weight: 1
    }).addTo(map);


    // --- 6. ЗАРЕЖДАНЕ НА НОВИНИ ОТ JSON ---
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            if (!data) return;

            let fatalitiesTotal = 0;
            let countriesSet = new Set();

            data.forEach(point => {
                // Създаване на маркер
                let marker = L.marker([point.lat, point.lon], {
                    icon: getTacticalIcon(point.type)
                }).addTo(map);

                marker.bindTooltip(`<b>${point.country}</b>`);

                // Клик върху маркер
                marker.on('click', function() {
                    map.setView([point.lat, point.lon], 6, { animate: true });

                    let fatalHTML = (point.fatalities > 0) 
                        ? `<p style="color: #ff4d4d; font-size: 18px;">💀 Жертви: ${point.fatalities}</p>` 
                        : "";

                    document.getElementById('news-content').innerHTML = `
                        <div style="border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | ${point.type}</small>
                        </div>
                        <div style="background: #111; padding: 15px; border-radius: 8px; border-left: 5px solid #ff4d4d;">
                            <p style="color: #fff; line-height: 1.5;">${point.title}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            ${fatalHTML}
                            <a href="${point.link}" target="_blank" class="news-btn" style="display: block; text-align: center; text-decoration: none;">ДЕТАЙЛИ В LIVEUAMAP</a>
                        </div>
                    `;
                });

                // Статистика
                fatalitiesTotal += (parseInt(point.fatalities) || 0);
                countriesSet.add(point.country);
            });

            // Обновяване на таблото
            document.getElementById('active-events').innerText = "Active events: " + data.length;
            document.getElementById('total-fatalities').innerText = "Total fatalities: " + fatalitiesTotal;
            document.getElementById('countries-affected').innerText = "Countries affected: " + countriesSet.size;
            document.getElementById('last-update').innerText = "Last update: " + new Date().toLocaleDateString();
        })
        .catch(error => console.error("Грешка при четене на данни:", error));


    // --- 7. КОРЕКЦИЯ НА РАЗМЕРА ---
    setTimeout(function() {
        map.invalidateSize();
    }, 600);

};
