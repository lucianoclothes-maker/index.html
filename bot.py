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

geolocator = Nominatim(user_agent="global_conflict_monitor_v6")

def extract_info(text):
    # Локации (Градове и Държави)
    locations = {
        "Ukraine": ["Kyiv", "Kharkiv", "Donetsk", "Crimea", "Odesa", "Kursk", "Ukraine", "Russia", "Bakhmut", "Lyman"],
        "Middle East": ["Gaza", "Israel", "Lebanon", "Iran", "Yemen", "Rafah", "Tehran", "Tel Aviv", "Beirut", "Red Sea"],
        "Africa": ["Sudan", "Mali", "Congo", "Khartoum", "Darfur", "Somalia", "Ethiopia"],
        "Asia": ["Taiwan", "North Korea", "South Korea", "Myanmar"]
    }
    
    # РАЗШИРЕНИ Ключови думи за ИКОНКИ
    event_map = {
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "air strike", "attacked", "intercepted"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "pounding", "destroyed", "hit", "fire", "damaged"],
        "Naval": ["ship", "vessel", "navy", "sea", "maritime", "boat", "crossing", "port", "black sea", "cargo"],
        "Drone": ["drone", "uav", "shahed", "quadcopter", "unmanned", "fpv"],
        "Clashes": ["clashes", "fighting", "battle", "infantry", "siege", "forces", "military", "clash", "offensive", "warrior"]
    }

    found_city = None
    found_region = "World"
    
    # Търсене на локация
    for region, cities in locations.items():
        for city in cities:
            if city.lower() in text.lower():
                found_city, found_region = city, region
                break
        if found_city: break

    # Търсене на тип събитие (Иконка)
    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in text.lower() for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def run_bot():
    all_events = []
    print(f"🌍 Стартирам мониторинг и разпознаване на икони...")

    for url in FEEDS:
        try:
            response = requests.get(url, timeout=15)
            # По-добро чистене на заглавията
            titles = re.findall(r'<title>(.*?)</title>', response.text)
            links = re.findall(r'<link>(.*?)</link>', response.text)
            
            for i in range(
