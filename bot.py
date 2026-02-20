import requests
import json
import re
from geopy.geocoders import Nominatim
import time

# 1. Списък с медии
FEEDS = [
    "https://www.politico.eu/rss", "https://rss.cnn.com/rss/edition_world.rss",
    "http://feeds.bbci.co.uk/news/world/rss.xml", "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss", "https://www.kyivpost.com/feed",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/", "https://www.longwarjournal.org/feed"
]

geolocator = Nominatim(user_agent="global_conflict_monitor_v7")

def extract_info(text):
    text = text.lower()
    # Локации
    locations = {
        "Ukraine": ["kyiv", "kharkiv", "donetsk", "crimea", "odesa", "kursk", "ukraine", "russia", "bakhmut", "donbas"],
        "Middle East": ["gaza", "israel", "lebanon", "iran", "yemen", "rafah", "tehran", "tel aviv", "beirut", "red sea", "hamas", "idf", "houthi"],
        "Africa": ["sudan", "mali", "congo", "khartoum", "darfur", "somalia", "ethiopia", "africa"],
        "Asia": ["taiwan", "china", "korea", "myanmar"]
    }
    
    # СУПЕР АГРЕСИВЕН СПИСЪК ЗА ИКОНКИ
    event_map = {
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "hit", "targeted", "air strike", "bombed"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "pounding", "destroyed", "fire", "killed", "dead", "fatalities"],
        "Naval": ["ship", "vessel", "navy", "sea", "maritime", "boat", "port", "water", "crossing", "cargo", "black sea"],
        "Drone": ["drone", "uav", "shahed", "quadcopter", "unmanned", "fpv", "air", "intercepted"],
        "Clashes": ["clashes", "fighting", "battle", "infantry", "siege", "forces", "military", "war", "army", "clash", "offensive", "soldier"]
    }

    found_city = None
    found_region = "World"
    
    # 1. Търсим град или държава
    for region, cities in locations.items():
        for city in cities:
            if city in text:
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break

    # 2. Търсим тип иконка (ако няма нищо, ще е Breaking News)
    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in text for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def run_bot():
    all_events = []
    print(f"🌍 Стартирам претърсване за новини и иконки...")

    for url in FEEDS:
        try:
            response = requests.get(url, timeout=15)
            # Чистене на XML таговете
            titles = re.findall(r'<title>(.*?)</title>', response.text)
            links = re.findall(r'<link>(.*?)</link>', response.text)
            
            for i in range(len(titles)):
                title = titles[i].replace("<![CDATA[", "").replace("]]>", "").strip()
                # Прескачаме ненужни заглавия
                if len
