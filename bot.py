import requests
import json
import re
from geopy.geocoders import Nominatim
import time
import xml.etree.ElementTree as ET
import os

# --- 1. НАСТРОЙКИ И ИЗТОЧНИЦИ ---
USER_AGENT = "military_intel_bot_v6_borislav"
geolocator = Nominatim(user_agent=USER_AGENT)

FEEDS = [
    "https://www.politico.eu/rss", 
    "https://rss.cnn.com/rss/edition_world.rss",
    "http://feeds.bbci.co.uk/news/world/rss.xml", 
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss", 
    "https://www.kyivpost.com/feed",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/", 
    "https://www.longwarjournal.org/feed",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.france24.com/en/rss", 
    "https://www.dw.com/en/top-stories/s-9097", 
    "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    "https://warnews247.gr/feed/", 
    "https://www.zerohedge.com/feed", 
    "https://southfront.press/feed/",
    "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10",
    "https://www.understandingwar.org/rss.xml"
]

# Кеш за локации, за да не питаме интернет всеки път (Ускорява бота 5 пъти)
LOCATION_CACHE = {
    "kyiv": [50.45, 30.52], "moscow": [55.75, 37.61], "gaza": [31.5, 34.46],
    "donetsk": [48.01, 37.80], "kharkiv": [49.99, 36.23], "bakhmut": [48.59, 38.00],
    "beirut": [33.89, 35.50], "tehran": [35.68, 51.38], "tel aviv": [32.08, 34.78],
    "washington": [38.90, -77.03], "taipei": [25.03, 121.56], "khartoum": [15.50, 32.55]
}

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    cleantext = re.sub(cleanr, '', str(raw_html))
    return cleantext.replace("<![CDATA[", "").replace("]]>", "").strip()

def extract_info(text):
    t = text.lower()
    locations = {
        "Ukraine": ["kyiv", "kharkiv", "donetsk", "crimea", "odesa", "donbas", "kursk", "zaporizhzhia", "bakhmut", "avdiivka"],
        "Russia": ["moscow", "kremlin", "voronezh", "belgorod", "rostov", "novorossiysk", "tuapse", "engels"],
        "Middle East": ["gaza", "israel", "lebanon", "iran", "yemen", "tehran", "tel aviv", "beirut", "red sea", "hezbollah"],
        "Africa": ["sudan", "mali", "congo", "khartoum", "darfur", "somalia", "niger"],
        "USA": ["washington", "pentagon", "white house", "norfolk"],
        "China": ["beijing", "taiwan", "south china sea", "pla"]
    }
    
    event_map = {
        "Naval": ["ship", "vessel", "navy", "maritime", "carrier", "destroyer", "black sea fleet"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "ballistic"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "fire", "killed"],
        "Drone": ["drone", "uav", "shahed", "fpv", "kamikaze"],
        "Clashes": ["clashes", "fighting", "battle", "siege", "frontline", "tank"],
        "Nuclear": ["nuclear", "atomic", "radiation", "npp", "icbm"]
    }

    found_city, found_region = None, "World"
    for region, cities in locations.items():
        for city in cities:
            if city in t:
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break

    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in t for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def get_coordinates(city, region):
    city_low = city.lower()
    # Първо проверяваме кеша
    if city_low in LOCATION_CACHE:
        return LOCATION_CACHE[city_low][0], LOCATION_CACHE[city_low][1]
    
    # Ако го няма, питаме Nominatim с таймаут
    try:
        time.sleep(1.1) # Задължителна пауза за Nominatim
        loc = geolocator.geocode(f"{city}, {region}", timeout=10)
        if loc:
            return loc.latitude, loc.longitude
    except:
        return None, None
    return None, None

def run_bot():
    all_events = []
    print(f"📡 --- STARTING INTEL SCAN v6 (BORISLAV) ---")
    
    for url in FEEDS:
        print(f"🔍 Scanning: {url.split('/')[2]}...")
        try:
            # Сложен таймаут от 7 секунди, за да не забива на 17 минути
            res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=7)
            if res.status_code != 200: continue
            
            root = ET.fromstring(res.content)
            for item in root.findall('.//item')[:10]: # Вземаме само топ 10 новини от източник
                title = clean_html(item.find('title').text if item.find('title') is not None else "")
                desc = clean_html(item.find('description').text if item.find('description') is not None else "")
                link = item.find('link').text if item.find('link') is not None else "#"

                if len(title) < 25: continue
                
                city, region, event_type = extract_info(title + " " + desc)
                
                if city:
                    lat, lon = get_coordinates(city, region)
                    if lat and lon:
                        death_match = re.search(r'(\d+)\s+(killed|dead|fatalities)', (title + " " + desc).lower())
                        fatalities = death_match.group(1) if death_match else "0"
                        
                        all_events.append({
                            "country": region,
                            "lat": lat, "lon": lon,
                            "date": time.strftime("%Y-%m-%d %H:%M"),
                            "type": event_type, 
                            "title": title[:100],
                            "description": desc[:300] if desc else f"Strategic update from {city}.",
                            "fatalities": fatalities,
                            "link": link
                        })
        except Exception as e:
            print(f"⚠️ Error on {url}: {str(e)[:50]}")

    # Премахване на дубликати
    unique_events = {e['title']: e for e in all_events}.values()
    
    # Запис в JSON
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_events), f, indent=4, ensure_ascii=False)
    
    print(f"✅ SCAN COMPLETE. SAVED {len(unique_events)} EVENTS.")

if __name__ == "__main__":
    # МАХАТЕ WHILE TRUE ЦИКЪЛА ТУК! 
    # GitHub Actions ще стартира скрипта, той ще свърши и ще затвори сам.
    run_bot()
