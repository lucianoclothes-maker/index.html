import requests
import json
import re
from geopy.geocoders import Nominatim
import time

# Списък с новинарски емисии
FEEDS = [
    "https://www.politico.eu/rss", "https://rss.cnn.com/rss/edition_world.rss",
    "http://feeds.bbci.co.uk/news/world/rss.xml", "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss", "https://www.kyivpost.com/feed",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/", "https://www.longwarjournal.org/feed"
]

geolocator = Nominatim(user_agent="conflict_map_final_fix")

def extract_info(text):
    text = text.lower()
    
    # Речник за локации
    locations = {
        "Ukraine": ["kyiv", "kharkiv", "donetsk", "crimea", "odesa", "kursk", "ukraine", "russia", "bakhmut"],
        "Middle East": ["gaza", "israel", "lebanon", "iran", "yemen", "rafah", "tehran", "tel aviv", "beirut", "red sea"],
        "Africa": ["sudan", "mali", "congo", "khartoum", "darfur", "somalia", "ethiopia"]
    }
    
    # СУПЕР АГРЕСИВНО КЛАСИФИЦИРАНЕ (това ще отключи иконките)
    event_map = {
        "Naval": ["ship", "vessel", "navy", "sea", "maritime", "boat", "port", "water", "crossing", "carrier"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "pounding", "destroyed", "hit", "fire", "killed"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "intercepted", "air strike"],
        "Clashes": ["clashes", "fighting", "battle", "infantry", "siege", "forces", "military", "war", "army", "clash", "offensive"]
    }

    found_city = None
    found_region = "World"
    for region, cities in locations.items():
        for city in cities:
            if city in text:
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break

    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in text for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def run_bot():
    all_events = []
    print("🌍 Стартирам бота...")

    for url in FEEDS:
        try:
            response = requests.get(url, timeout=15)
            titles = re.findall(r'<title>(.*?)</title>', response.text)
            links = re.findall(r'<link>(.*?)</link>', response.text)
            
            for i in range(len(titles)):
                title = titles[i].replace("<![CDATA[", "").replace("]]>", "").strip()
                if len(title) < 15: continue

                city, region, event_type = extract_info(title)
                
                if city:
                    try:
                        location = geolocator.geocode(city)
                        if location:
                            all_events.append({
                                "country": region,
                                "lat": location.latitude,
                                "lon": location.longitude,
                                "date": time.strftime("%Y-%m-%d"),
                                "type": event_type, 
                                "title": title[:120],
                                "link": links[i] if i < len(links) else url
                            })
                    except: continue
        except: continue
    
    # Махаме дубликати и записваме
    unique_events = { (e['lat'], e['lon']): e for e in all_events }.values()
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_events), f, indent=4, ensure_ascii=False)
    
    print(f"✅ Готово! Намерени {len(unique_events)} събития.")

if __name__ == "__main__":
    run_bot()
