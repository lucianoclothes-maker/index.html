/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v13.0 - HARDENED + STATUS VISUAL UPGRADE
 * =============================================================================
 */

window.onload = function() {
    
    let globalLastEventTitle = ""; 

    // --- СЕКЦИЯ 1: КОНФИГУРАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.1,
        wheelDebounceTime: 60
    }).setView([35.0, 40.0], 4.2); 

    const markersLayer = L.layerGroup().addTo(map);
    const militaryLayer = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        crossOrigin: true
    }).addTo(map);

    // --- СЕКЦИЯ 2: ГЕОПОЛИТИЧЕСКИ ДАННИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq', 'Lebanon'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    const tensionZones = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'Turkey', 'Saudi Arabia'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
    .then(res => res.json())
    .then(geoData => {

        L.geoJson(geoData, {

            style: function(feature) {
                const n = feature.properties.name;

                if (warZones.includes(n))
                    return { fillColor:"#ff0000", weight:2.5, color:"#ff3131", fillOpacity:0.35, className:"war-border" };

                if (tensionZones.includes(n))
                    return { fillColor:"#ff8c00", weight:2.0, color:"#ff8c00", fillOpacity:0.25, className:"tension-glow" };

                if (blueZone.includes(n))
                    return { fillColor:"#0055ff", weight:2.0, color:"#00a2ff", fillOpacity:0.25 };

                return { fillColor:"#000", weight:0.6, color:"#333", fillOpacity:0.1 };
            },

            onEachFeature: function(feature, layer) {

                const n = feature.properties.name;

                let status = "STABLE";
                let statusColor = "#999";

                if (warZones.includes(n)) {
                    status = "IN WAR";
                    statusColor = "#ff3131";
                }
                else if (tensionZones.includes(n)) {
                    status = "CRITICAL";
                    statusColor = "#ff8c00";
                }
                else if (blueZone.includes(n)) {
                    status = "MONITORING";
                    statusColor = "#00a2ff";
                }

                layer.bindTooltip(`
                    <div style="
                        background:#000;
                        color:#39FF14;
                        border:1px solid #222;
                        padding:6px;
                        font-family:monospace;
                        min-width:140px;
                    ">
                        <div style="font-weight:bold; font-size:12px;">
                            ${n.toUpperCase()}
                        </div>
                        <div style="margin-top:4px; font-size:11px; color:${statusColor};">
                            ${status}
                        </div>
                    </div>
                `, { sticky:true });

                layer.on('mouseover', function() {
                    this.setStyle({ fillOpacity:0.55, weight:3.5 });
                });

                layer.on('mouseout', function() {
                    this.setStyle({
                        fillOpacity:
                            warZones.includes(n) ? 0.35 :
                            tensionZones.includes(n) ? 0.25 :
                            blueZone.includes(n) ? 0.25 : 0.1,
                        weight:
                            warZones.includes(n) ? 2.5 :
                            tensionZones.includes(n) ? 2.0 :
                            blueZone.includes(n) ? 2.0 : 0.6
                    });
                });
            }

        }).addTo(map);

    });

    // --- СЕКЦИЯ 3: ВОЕННИ АКТИВИ ---
    const strategicAssets = [
        { name:"US 5th Fleet HQ (Bahrain)", type:"us-naval", lat:26.21, lon:50.60 },
        { name:"Al Udeid Air Base (Qatar)", type:"us-air", lat:25.11, lon:51.21 },
        { name:"Tehran Central Command", type:"ir-pvo", lat:35.68, lon:51.41 },
        { name:"Bushehr Nuclear Defense", type:"ir-pvo", lat:28.82, lon:50.88 },
        { name:"Sevastopol Naval Base", type:"ru-naval", lat:44.61, lon:33.53 },
        { name:"Tartus Port (Russia)", type:"ru-naval", lat:34.88, lon:35.88 },
        { name:"Odesa Strategic Port", type:"ua-port", lat:46.48, lon:30.72 },
        { name:"Kyiv Defense Bunker", type:"ua-hq", lat:50.45, lon:30.52 },
        { name:"Incirlik Air Base (NATO)", type:"us-air", lat:37.00, lon:35.42 },
        { name:"Aviano Air Base (Italy)", type:"us-air", lat:46.03, lon:12.59 },
        { name:"Diego Garcia Base", type:"us-naval", lat:-7.31, lon:72.41 },
        { name:"Kaliningrad HQ", type:"ru-hq", lat:54.71, lon:20.45 }
    ];

    const customStyles = document.createElement("style");
    customStyles.innerText = `
        .leaflet-marker-icon { background:none !important; border:none !important; }

        .mil-icon-box { display:flex; align-items:center; justify-content:center; border-radius:50%; border:1px solid #fff; box-shadow:0 0 8px #000; transition:0.3s; }
        .icon-us-nato { background:rgba(57,255,20,0.45); border-color:#39FF14; }
        .icon-iran-tension { background:rgba(255,140,0,0.45); border-color:#ff8c00; }
        .icon-ru-ua { background:rgba(255,0,0,0.45); border-color:#ff3131; }

        .alert-pulse { animation:alert-anim 2s infinite alternate; cursor:pointer; filter:drop-shadow(0 0 15px #ff3131); }
        @keyframes alert-anim { from{transform:scale(1);opacity:1;} to{transform:scale(1.35);opacity:0.5;} }

        .war-border { animation:warPulse 2s infinite alternate; }
        @keyframes warPulse {
            from { stroke-width:2.5; filter:drop-shadow(0 0 5px #ff0000); }
            to { stroke-width:4; filter:drop-shadow(0 0 15px #ff0000); }
        }

        .tension-glow { filter:drop-shadow(0 0 12px #ff8c00); }
    `;
    document.head.appendChild(customStyles);

    function createAssetIcon(type) {
        let symbol='✈️';
        let styleClass='mil-icon-box ';

        if(type.startsWith('us-')){
            styleClass+='icon-us-nato';
            symbol=type.includes('naval')?'⚓':'🦅';
        }else if(type.startsWith('ir-')){
            styleClass+='icon-iran-tension';
            symbol=type.includes('pvo')?'📡':'☢️';
        }else{
            styleClass+='icon-ru-ua';
            symbol=type.includes('naval')?'⚓':'🚢';
        }

        return L.divIcon({
            html:`<div class="${styleClass}" style="font-size:18px;width:34px;height:34px;">${symbol}</div>`,
            iconSize:[34,34]
        });
    }

    strategicAssets.forEach(asset=>{
        L.marker([asset.lat,asset.lon],{icon:createAssetIcon(asset.type)})
         .addTo(militaryLayer)
         .bindTooltip(asset.name);
    });

    function syncTacticalData(){
        fetch('conflicts.json?v='+Date.now())
        .then(res=>res.json())
        .then(data=>{
            if(!Array.isArray(data))return;
            markersLayer.clearLayers();

            if(data.length>0 && data[0].title!==globalLastEventTitle){
                if(data[0].critical===true || data[0].type==="Evacuation"){
                    const audio=new Audio('alert.mp3');
                    audio.play().catch(()=>{});
                }
                globalLastEventTitle=data[0].title;
            }

            data.forEach(item=>{
                const icon=(item.critical||item.type==="Evacuation")?'🚨':'⚠️';
                const marker=L.marker([item.lat,item.lon],{
                    icon:L.divIcon({html:`<div class="alert-pulse" style="font-size:38px;">${icon}</div>`,iconSize:[45,45]})
                }).addTo(markersLayer);

                marker.on('click',()=>{
                    map.flyTo([item.lat,item.lon],7);
                });
            });
        });
    }

    syncTacticalData();
    setInterval(syncTacticalData,60000);
};

setInterval(()=>{
    const timeDisplay=document.getElementById('header-time');
    if(timeDisplay){
        const utcNow=new Date().toUTCString().split(' ')[4];
        timeDisplay.innerText=utcNow+" UTC";
    }
},1000);
