import feedparser
import json
from geopy.geocoders import Nominatim
import time

# Списък с източници
SOURCES = [
    "https://reliefweb.int/updates/rss.xml",
    "https://www.politico.eu/rss-source/defense/"
]

geolocator = Nominatim(user_agent="conflict_tracker_v2")

def fetch_news():
    new_data = []
    # Разширен списък за по-добра детекция
    hotspots = {
        "Ukraine": "Explosion",
        "Russia": "Airstrike",
        "Sudan": "Armed clash",
        "Gaza": "Explosion",
        "Israel": "Airstrike",
        "Syria": "Armed clash",
        "Yemen": "Airstrike",
        "Congo": "Armed clash",
        "Myanmar": "Armed clash"
    }

    for url in SOURCES:
        feed = feedparser.parse(url)
        source_name = "Politico" if "politico" in url else "ReliefWeb"
        print(f"Проверка на {source_name}...")

        for entry in feed.entries[:20]:
            title = entry.title
            found_country = None
            
            # Търсим държава в заглавието
            for country in hotspots.keys():
                if country.lower() in title.lower():
                    found_country = country
                    break
            
            if found_country:
                try:
                    location = geolocator.geocode(found_country)
                    if location:
                        # Създаваме обект, който JS кодът ще разбере веднага
                        new_data.append({
                            "country": found_country,
                            "date": time.strftime("%Y-%m-%d"),
                            "fatalities": 1, # ACLED стил
                            "type": hotspots[found_country],
                            "lat": location.latitude,
                            "lon": location.longitude,
                            "title": title # Пълното заглавие за панела
                        })
                        print(f" Намерено събитие: {found_country}")
                        time.sleep(1) # Защита срещу блокиране от Nominatim
                except:
                    continue

    # Вместо да трием всичко, ако е празно, запазваме старите данни
    if new_data:
        with open('conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
        print(f"Успех! Записани са {len(new_data)} новини.")
    else:
        print("Не бяха намерени нови новини в RSS емисиите.")

if __name__ == "__main__":
    fetch_news()
