import feedparser
import json
from geopy.geocoders import Nominatim
import time

# Източници на новини
SOURCES = [
    "https://reliefweb.int/updates/rss.xml",
    "https://www.politico.eu/rss-source/defense/"
]

# Инициализиране на геолокатора
geolocator = Nominatim(user_agent="conflict_tracker_final")

def fetch_news():
    new_data = []
    # Списък за детекция и автоматично определяне на типа събитие
    hotspots = {
        "Ukraine": "Explosion",
        "Russia": "Airstrike",
        "Sudan": "Armed clash",
        "Gaza": "Explosion",
        "Israel": "Airstrike",
        "Syria": "Armed clash",
        "Yemen": "Airstrike",
        "Congo": "Armed clash",
        "Myanmar": "Armed clash",
        "Libya": "Armed clash",
        "Somalia": "Explosion"
    }

    for url in SOURCES:
        feed = feedparser.parse(url)
        source_name = "Politico" if "politico" in url else "ReliefWeb"
        print(f"Сканиране на {source_name}...")

        for entry in feed.entries[:25]: # Проверяваме повече статии
            title = entry.title
            found_country = None
            
            for country in hotspots.keys():
                if country.lower() in title.lower():
                    found_country = country
                    break
            
            if found_country:
                try:
                    location = geolocator.geocode(found_country)
                    if location:
                        # ТУК Е ПОПРАВКАТА: Добавяме истински линк и пълно заглавие
                        new_data.append({
                            "country": found_country,
                            "date": time.strftime("%Y-%m-%d"),
                            "fatalities": 1,
                            "type": hotspots[found_country],
                            "lat": location.latitude,
                            "lon": location.longitude,
                            "title": title,         # Пълно заглавие за панела
                            "link": entry.link      # Истински линк за бутона
                        })
                        print(f" Намерено: {found_country}")
                        time.sleep(1.1) # Защита срещу блокиране
                except Exception as e:
                    print(f"Грешка при геолокация: {e}")
                    continue

    if new_data:
        # Записваме в JSON файла
        with open('conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
        print(f"Готово! Записани са {len(new_data)} активни конфликтни зони.")
    else:
        print("В момента няма нови събития в посочените региони.")

if __name__ == "__main__":
    fetch_news()
