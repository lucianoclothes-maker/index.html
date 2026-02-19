// Изчакваме целият HTML и CSS да се заредят напълно
window.onload = function() {
    
    // 1. Инициализиране на картата
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // 2. Функция за цветовете
    function getColor(type) {
        return type === 'Explosion' || type === 'Politico Alert' ? '#f03' :
               type === 'Airstrike' || type === 'UN Update' ? '#ff7800' :
               type === 'Armed clash' ? '#7a0177' : '#3388ff';
    }

    // 3. Зареждане на данни
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            let totalFatalities = 0;
            let countries = new Set();

            data.forEach(point => {
                let marker = L.circleMarker([point.lat, point.lon], {
                    radius: 10,
                    fillColor: getColor(point.type),
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);

                marker.on('click', function() {
                    document.getElementById('news-content').innerHTML = `
                        <div style="padding-top: 10px; border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | Тип: ${point.type}</small>
                        </div>
                        <div style="background: #333; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
                            <p style="font-size: 1.1em; line-height: 1.5; margin: 0;">${point.title || "Няма налично заглавие"}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            <p>💀 <strong>Жертви:</strong> ${point.fatalities}</p>
                            <br>
                            <a href="https://www.politico.eu/defense/" target="_blank" style="display: block; text-align: center; background: #4da6ff; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">ВИЖ ПОВЕЧЕ</a>
                        </div>
                    `;
                });

                totalFatalities += point.fatalities;
                countries.add(point.country);
            });

            // Обновяване на броячите
            document.getElementById('active-events').innerText = `Active events: ${data.length}`;
            document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
            document.getElementById('countries-affected').innerText = `Countries affected: ${countries.size}`;
            document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()}`;
        })
        .catch(err => console.error("Грешка:", err));

    // 4. ПРИНУДИТЕЛНО ПРЕОРАЗМЕРЯВАНЕ
    setTimeout(function() {
        map.invalidateSize();
    }, 500);
};
