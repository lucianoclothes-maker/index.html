window.onload = function() {
    // 1. Инициализиране на картата
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.4,
        pane: 'shadowPane'
    }).addTo(map);

    function getColor(type) {
        const colors = {
            'Explosion': '#ff4d4d',
            'Airstrike': '#ffae42',
            'Armed clash': '#9d4edd',
            'News Alert': '#3388ff'
        };
        return colors[type] || '#3388ff';
    }

    // 2. ЗЕЛЕНИ ГРАНИЦИ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                style: { color: '#00ff00', weight: 1, opacity: 0.3, fillOpacity: 0 }
            }).addTo(map);
        });

    // 3. ЗАРЕЖДАНЕ НА КОНФЛИКТИТЕ
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            if (!data) return;

            let totalFatalities = 0;
            let countries = new Set();

            data.forEach(point => {
                // Създаваме маркера
                let marker = L.circleMarker([point.lat, point.lon], {
                    radius: 10,
                    fillColor: getColor(point.type),
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8,
                    className: 'pulse'
                }).addTo(map);

                marker.bindTooltip(point.country);

                // ВАЖНО: Клик събитието
                marker.on('click', function(e) {
                    // Центрираме картата леко при клик
                    map.setView(e.target.getLatLng(), map.getZoom());

                    // Проверка за жертви (скриваме, ако са 0)
                    let fatalitiesHTML = (point.fatalities && point.fatalities > 0) 
                        ? `<p style="font-size: 16px;">💀 <strong>Жертви:</strong> ${point.fatalities}</p>` 
                        : "";

                    // Пълним панела вдясно
                    document.getElementById('news-content').innerHTML = `
                        <div style="border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0; font-size: 22px;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | ${point.type}</small>
                        </div>
                        <div style="background: #222; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
                            <p style="color: #fff; margin: 0; font-size: 15px;">${point.title}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            ${fatalitiesHTML}
                            <a href="${point.link}" target="_blank" class="news-btn" style="text-decoration: none;">ПРОЧЕТИ ПЪЛНАТА НОВИНА</a>
                        </div>
                    `;
                });

                totalFatalities += (parseInt(point.fatalities) || 0);
                if (point.country) countries.add(point.country);
            });

            // Обновяваме хедъра
            document.getElementById('active-events').innerText = `Active events: ${data.length}`;
            document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
            document.getElementById('countries-affected').innerText = `Countries affected: ${countries.size}`;
            document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()} г.`;
        })
        .catch(err => {
            console.error("Грешка в conflicts.json:", err);
            document.getElementById('news-content').innerHTML = "<p style='color:red;'>Грешка при зареждане на данните. Провери conflicts.json!</p>";
        });

    setTimeout(function() { map.invalidateSize(); }, 500);
};
