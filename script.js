// 1. Инициализираме картата
var map = L.map('map', {
    worldCopyJump: true, 
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]]
}).setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. Функция за цветовете
function getColor(type) {
    return type === 'Explosion' || type === 'Politico Alert' ? '#f03' :
           type === 'Airstrike' || type === 'UN Update' ? '#ff7800' :
           type === 'Armed clash' ? '#7a0177' :
                                    '#3388ff';
}

// 3. Зареждане на данни и страничен панел
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

            // ЛОГИКА ЗА КЛИК: Пълним страничния панел
            marker.on('click', function() {
                const sidebarContent = document.getElementById('news-content');
                
                sidebarContent.innerHTML = `
                    <div style="padding-top: 10px; border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                        <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                        <small style="color: #aaa;">${point.date} | Тип: ${point.type}</small>
                    </div>
                    <div style="background: #333; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
                        <p style="font-size: 1.15em; line-height: 1.5; margin: 0;">${point.title || "Няма налично заглавие"}</p>
                    </div>
                    <div style="margin-top: 20px; color: #eee;">
                        <p>💀 <strong>Жертви:</strong> ${point.fatalities}</p>
                        <p>📍 <strong>Координати:</strong> ${point.lat.toFixed(2)}, ${point.lon.toFixed(2)}</p>
                        <br>
                        <a href="https://www.politico.eu/defense/" target="_blank" 
                           style="display: block; text-align: center; background: #4da6ff; color: white; padding: 12px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                           ПРОЧЕТИ ПЪЛНАТА НОВИНА
                        </a>
                    </div>
                `;
            });

            totalFatalities += point.fatalities;
            countries.add(point.country);
        });

        // Обновяване на броячите горе
        document.getElementById('active-events').innerText = `Active events: ${data.length}`;
        document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
        document.getElementById('countries-affected').innerText = `Countries affected: ${countries.size}`;
        document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()}`;
    })
    .catch(err => console.error("Грешка при зареждане на JSON:", err));

// 4. Легендата
var legend = L.control({position: 'bottomright'});
legend.onAdd =
