import requests
import json
import re
from geopy.geocoders import Nominatim
import time

# 20+ Водещи източника на новини
FEEDS = [
    "https://www.politico.eu/rss", "https://rss.cnn.com/rss/edition_world.rss",
    "http://feeds.bbci.co.uk/news/world/rss.xml", "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss", "https://www.reutersagency.com/feed/",
    "https://www.dw.com/en/top-stories/rss", "https://www.france24.com/en/rss",
    "https://www.voanews.com/api/z$yite_kq_", "https://www.militarytimes.com/arc/outboundfeeds/rss/",
    "https://www.defensenews.com/arc/outboundfeeds/rss/", "https://www.longwarjournal.org/feed",
    "https://nypost.com/news/world/feed/", "https://www.telegraph.co.uk/world-news/rss.xml",
    "https://www.independent.co.uk/news/world/rss", "https://www.washingtontimes.com/rss/headlines/news/world/",
    "https://www.kyivpost.com/feed", "https://www.uawire.org/rss",
    "https://apnews.com/hub/world-news.rss", "https://www.timesofisrael.com/feed/"
]

geolocator = Nominatim(user_agent="global_conflict_monitor_v5")

def extract_geo(text):
    # Разширен списък за глобални конфликти
    locations = {
        "Ukraine": ["Kyiv", "Kharkiv", "Donetsk", "Bakhmut", "Crimea", "Odesa", "Kursk"],
        "Middle East": ["Gaza", "Rafah", "Beirut", "Tehran", "Tel Aviv", "Red Sea", "Yemen"],
        "Asia": ["Taiwan", "South China Sea", "Manila", "Seoul"],
        "Africa": ["Sudan", "Khartoum", "Congo", "Mali"]
    }
    for region, cities in locations.items():
        for city in cities:
            if city.lower() in text.lower():
                return city, region
    return None, None

def run_bot():
    all_events = []
    print(f"🌍 Стартирам глобален мониторинг на {len(FEEDS)} медии...")

    for url in FEEDS:
        try:
            response = requests.get(url, timeout=15)
            # Намираме всички <title> и <link> тагове
            titles = re.findall(r'<title>(.*?)</title>', response.text)
            links = re.findall(r'<link>(.*?)</link>', response.text)
            
            for i in range(len(titles)):
                title = titles[i].replace("<![CDATA[", "").replace("]]>", "")
                city, region = extract_geo(title)
                
                if city:
                    location = geolocator.geocode(city)
                    if location:
                        all_events.append({
                            "country": region,
                            "lat": location.latitude,
                            "lon": location.longitude,
                            "date": time.strftime("%Y-%m-%d"),
                            "type": "Breaking News",
                            "title": title[:110],
                            "link": links[i] if i < len(links) else url
                        })
        except: continue
    
    # Премахване на дубликати и запис
    unique_events = { (e['lat'], e['lon']): e for e in all_events }.values()
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_events), f, indent=4, ensure_ascii=False)
    
    print(f"✅ Готово! Картата е обновена с {len(unique_events)} световни новини.")

if __name__ == "__main__":
    run_bot()
