import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  IFAP_CAMPUS_CENTER,
  CAMPUS_BUILDINGS_GEO,
  ROUTE_WAYPOINTS_DETAILED,
  POPULAR_LOCATIONS,
  CampusBuildingGeo,
} from '../data/campusData';
import { GpsCoordinate } from '../types';

interface CampusGpsMapProps {
  onNavigateToRotas?: (dest: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
  initialDestination?: string;
  isNavigationActive?: boolean;
  onToggleNavigation?: (active: boolean) => void;
}

export const CampusGpsMap: React.FC<CampusGpsMapProps> = ({
  onNavigateToRotas,
  onShowToast,
  initialDestination = 'Lab. de Informática 03 (Bloco C)',
  isNavigationActive = false,
  onToggleNavigation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routePassedPolylineRef = useRef<L.Polyline | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const hybridLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);

  // States
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  const [navigating, setNavigating] = useState(isNavigationActive);
  const [simulating, setSimulating] = useState(false);
  const [useRealGps, setUseRealGps] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<GpsCoordinate>(ROUTE_WAYPOINTS_DETAILED[0]);
  const [userHeading, setUserHeading] = useState(45);
  const [userSpeed, setUserSpeed] = useState(4.2);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuildingGeo | null>(null);
  const [isCompassLocked, setIsCompassLocked] = useState(true);
  const [showSatelliteGuide, setShowSatelliteGuide] = useState(false);

  // Watch position ID
  const watchIdRef = useRef<number | null>(null);
  const simulationTimerRef = useRef<any>(null);

  // Speech helper
  const speakInstruction = useCallback(
    (text: string) => {
      if (isVoiceMuted || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Voice synthesis error handling
      }
    },
    [isVoiceMuted]
  );

  // Calculate remaining distance and time
  const remainingMeters = Math.max(
    0,
    Math.round((ROUTE_WAYPOINTS_DETAILED.length - 1 - currentWaypointIndex) * 20)
  );
  const remainingMinutes = Math.max(1, Math.ceil(remainingMeters / 65));
  const currentInstruction =
    ROUTE_WAYPOINTS_DETAILED[currentWaypointIndex]?.instruction ||
    'Siga pela passarela principal em direção ao Bloco C';

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map centered on IFAP Campus Macapá
    const map = L.map(mapContainerRef.current, {
      center: [IFAP_CAMPUS_CENTER.lat, IFAP_CAMPUS_CENTER.lng],
      zoom: 17,
      minZoom: 15,
      maxZoom: 21,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite Imagery Layer (Google Maps Satellite Hybrid with high-res photo and road/facility labels)
    const satelliteLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxZoom: 21,
        subdomains: ['0', '1', '2', '3'],
      }
    );

    // Hybrid Labels & Roads Layer (Esri fallback labels)
    const hybridLabels = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 20,
      }
    );

    // Street / Vector Map Layer (OpenStreetMap CartoDB Voyager)
    const streetLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        subdomains: 'abcd',
      }
    );

    satelliteLayerRef.current = satelliteLayer;
    hybridLabelsLayerRef.current = hybridLabels;
    streetLayerRef.current = streetLayer;

    // Add satellite by default
    satelliteLayer.addTo(map);
    hybridLabels.addTo(map);

    // Add Building Polygons
    CAMPUS_BUILDINGS_GEO.forEach((building) => {
      const polygon = L.polygon(building.polygon, {
        color: building.color,
        fillColor: building.fillColor,
        fillOpacity: 0.55,
        weight: 2.5,
      }).addTo(map);

      // Custom Building Label Marker
      const labelIcon = L.divIcon({
        className: 'campus-building-label',
        html: `
          <div style="
            background: rgba(17, 28, 44, 0.88);
            backdrop-filter: blur(4px);
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 6px;
            border-radius: 6px;
            border: 1px solid ${building.color};
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${building.fillColor}; display: inline-block;"></span>
            ${building.code}
          </div>
        `,
        iconAnchor: [35, 12],
      });

      const labelMarker = L.marker([building.center.lat, building.center.lng], {
        icon: labelIcon,
      }).addTo(map);

      const handleClick = () => {
        setSelectedBuilding(building);
        map.panTo([building.center.lat, building.center.lng], { animate: true });
      };

      polygon.on('click', handleClick);
      labelMarker.on('click', handleClick);
    });

    // Add Route Polyline
    const routeCoords = ROUTE_WAYPOINTS_DETAILED.map((wp) => [wp.lat, wp.lng] as [number, number]);

    // Background dashed casing
    L.polyline(routeCoords, {
      color: '#ffffff',
      weight: 9,
      opacity: 0.9,
      lineCap: 'round',
    }).addTo(map);

    // Main Google Maps style route line
    const mainRouteLine = L.polyline(routeCoords, {
      color: '#1A73E8', // Google Maps vibrant blue
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routePolylineRef.current = mainRouteLine;

    // Passed route in gray/green
    const passedRouteLine = L.polyline([], {
      color: '#10B981',
      weight: 6,
      opacity: 0.8,
    }).addTo(map);
    routePassedPolylineRef.current = passedRouteLine;

    // Destination Marker
    const destWp = ROUTE_WAYPOINTS_DETAILED[ROUTE_WAYPOINTS_DETAILED.length - 1];
    const destIcon = L.divIcon({
      className: 'destination-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #EA4335;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        ">
          <span style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">★</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
    L.marker([destWp.lat, destWp.lng], { icon: destIcon }).addTo(map);

    // User Location Puck Marker (Pulsing navigation puck with direction beam)
    const initialUserWp = ROUTE_WAYPOINTS_DETAILED[0];
    const userPuckIcon = L.divIcon({
      className: 'user-nav-puck',
      html: `
        <div id="puck-wrapper" style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Directional radar cone / heading beam -->
          <div id="heading-beam" style="
            position: absolute;
            top: -14px;
            width: 0;
            height: 0;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-bottom: 22px solid rgba(26, 115, 232, 0.45);
            transform-origin: bottom center;
            transform: rotate(45deg);
          "></div>
          <!-- Outer Pulsing Glow -->
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(26, 115, 232, 0.35);
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          "></div>
          <!-- Inner Core Blue Dot -->
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #1A73E8;
            border: 3px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          "></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const userMarker = L.marker([initialUserWp.lat, initialUserWp.lng], {
      icon: userPuckIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    userMarkerRef.current = userMarker;

    // Accuracy circle
    const accuracyCircle = L.circle([initialUserWp.lat, initialUserWp.lng], {
      radius: 12,
      color: '#1A73E8',
      fillColor: '#1A73E8',
      fillOpacity: 0.12,
      weight: 1,
    }).addTo(map);
    accuracyCircleRef.current = accuracyCircle;

    // Fit campus bounds matching the satellite photo (from northern solar panels to southern gym)
    const campusBounds = L.latLngBounds(
      [0.08460, -51.09330],
      [0.08765, -51.09110]
    );
    map.fitBounds(campusBounds, { padding: [16, 16] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Layer (Satellite vs Street)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !satelliteLayerRef.current || !streetLayerRef.current) return;

    if (mapType === 'satellite') {
      map.removeLayer(streetLayerRef.current);
      satelliteLayerRef.current.addTo(map);
      if (hybridLabelsLayerRef.current) {
        hybridLabelsLayerRef.current.addTo(map);
      }
    } else {
      map.removeLayer(satelliteLayerRef.current);
      if (hybridLabelsLayerRef.current) {
        map.removeLayer(hybridLabelsLayerRef.current);
      }
      streetLayerRef.current.addTo(map);
    }
  }, [mapType]);

  // Update user puck position and heading
  const updateUserPositionOnMap = useCallback(
    (coords: GpsCoordinate, heading: number, zoomToUser: boolean = false) => {
      setUserLocation(coords);
      setUserHeading(heading);

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([coords.lat, coords.lng]);

        // Update beam rotation
        const beamEl = document.getElementById('heading-beam');
        if (beamEl) {
          beamEl.style.transform = `rotate(${heading}deg)`;
        }
      }

      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([coords.lat, coords.lng]);
      }

      if (mapInstanceRef.current && (zoomToUser || isCompassLocked)) {
        mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true });
      }
    },
    [isCompassLocked]
  );

  // Real GPS geolocation watcher
  useEffect(() => {
    if (!useRealGps) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      onShowToast('Geolocalização não suportada neste dispositivo', 'warning');
      setUseRealGps(false);
      return;
    }

    onShowToast('Buscando sinal de GPS em tempo real...', 'gps_fixed');

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude };
        const calculatedHeading = heading || 0;
        const currentSpeedKmh = speed ? Math.round(speed * 3.6 * 10) / 10 : 4.0;

        setUserSpeed(currentSpeedKmh);
        updateUserPositionOnMap(newCoords, calculatedHeading, true);
        onShowToast(`GPS Conectado: precisão ${Math.round(pos.coords.accuracy)}m`, 'my_location');
      },
      (err) => {
        console.warn('GPS error, switching to campus simulation fallback', err);
        onShowToast('Sinal de GPS fraco ou não autorizado. Usando avanço assistido.', 'info');
        setUseRealGps(false);
        setSimulating(true);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [useRealGps, onShowToast, updateUserPositionOnMap]);

  // Simulated Real-Time Navigation Advance
  useEffect(() => {
    if (!simulating) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(600, Math.round(1800 / simSpeedMultiplier));

    simulationTimerRef.current = setInterval(() => {
      setCurrentWaypointIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= ROUTE_WAYPOINTS_DETAILED.length) {
          // Reached destination!
          setSimulating(false);
          speakInstruction('Você chegou ao seu destino no Bloco C!');
          onShowToast('Você chegou ao Laboratório de Informática 03!', 'celebration');
          return ROUTE_WAYPOINTS_DETAILED.length - 1;
        }

        const currentWp = ROUTE_WAYPOINTS_DETAILED[nextIdx];
        const prevWp = ROUTE_WAYPOINTS_DETAILED[prevIdx];

        // Calculate heading angle
        const dy = currentWp.lat - prevWp.lat;
        const dx = (currentWp.lng - prevWp.lng) * Math.cos((prevWp.lat * Math.PI) / 180);
        const headingDeg = Math.round((Math.atan2(dx, dy) * 180) / Math.PI);

        updateUserPositionOnMap(currentWp, headingDeg, true);
        setUserSpeed(currentWp.speedKmh * simSpeedMultiplier);

        // Update passed line
        if (routePassedPolylineRef.current) {
          const passedCoords = ROUTE_WAYPOINTS_DETAILED.slice(0, nextIdx + 1).map((w) => [
            w.lat,
            w.lng,
          ] as [number, number]);
          routePassedPolylineRef.current.setLatLngs(passedCoords);
        }

        // Announce key turns
        if (currentWp.instruction) {
          speakInstruction(currentWp.instruction);
        }

        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, [simulating, simSpeedMultiplier, speakInstruction, onShowToast, updateUserPositionOnMap]);

  // Start navigation mode
  const handleStartNavigation = () => {
    setNavigating(true);
    setSimulating(true);
    if (onToggleNavigation) onToggleNavigation(true);
    speakInstruction('Iniciando navegação guiada no IFAP Campus Macapá. Siga pela passarela principal.');
    onShowToast('Navegação em tempo real iniciada!', 'navigation');
  };

  // Stop navigation mode
  const handleStopNavigation = () => {
    setNavigating(false);
    setSimulating(false);
    setUseRealGps(false);
    setCurrentWaypointIndex(0);
    if (onToggleNavigation) onToggleNavigation(false);
    const initialWp = ROUTE_WAYPOINTS_DETAILED[0];
    updateUserPositionOnMap(initialWp, 45, true);
    if (routePassedPolylineRef.current) {
      routePassedPolylineRef.current.setLatLngs([]);
    }
    onShowToast('Navegação finalizada.', 'close');
  };

  // Recenter map on user puck
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 18, { animate: true });
      setIsCompassLocked(true);
      onShowToast('Câmera centralizada em você', 'my_location');
    }
  };

  return (
    <div className="relative w-full h-[65vh] min-h-[420px] max-h-[720px] bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col">
      {/* Interactive Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP FLOATING HUD - When Navigating (Turn-by-turn Navigation Banner) */}
      {navigating ? (
        <div className="absolute top-3 inset-x-3 z-30 flex flex-col gap-2">
          {/* Main Direction Banner */}
          <div className="bg-[#004d1f]/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Turn Icon Box */}
              <div className="w-12 h-12 rounded-xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-white">
                <span className="material-symbols-outlined text-[30px]">
                  {currentWaypointIndex >= ROUTE_WAYPOINTS_DETAILED.length - 2
                    ? 'pin_drop'
                    : currentWaypointIndex >= 6
                    ? 'turn_left'
                    : 'straight'}
                </span>
              </div>

              {/* Text Instruction */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg text-emerald-300">
                    {currentWaypointIndex >= ROUTE_WAYPOINTS_DETAILED.length - 1
                      ? 'Destino'
                      : `Em ${Math.max(15, (ROUTE_WAYPOINTS_DETAILED.length - currentWaypointIndex) * 15)}m`}
                  </span>
                  <span className="bg-emerald-800/80 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-emerald-200">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs font-semibold text-white truncate leading-snug">
                  {currentInstruction}
                </p>
                <span className="text-[10px] text-emerald-200/80 truncate">
                  Passarela Central • Sentido Bloco C
                </span>
              </div>
            </div>

            {/* Voice Mute Toggle */}
            <button
              onClick={() => {
                setIsVoiceMuted(!isVoiceMuted);
                onShowToast(isVoiceMuted ? 'Voz ativada' : 'Voz desativada', isVoiceMuted ? 'volume_up' : 'volume_off');
              }}
              className="p-2.5 rounded-full bg-black/25 hover:bg-black/40 text-emerald-200 transition-colors flex-shrink-0"
              title={isVoiceMuted ? 'Ativar Voz' : 'Desativar Voz'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isVoiceMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Top Quick Map Controls when not navigating */
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Layer Selector (Satélite vs Vetor) */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-1 shadow-md border border-outline-variant/30 flex items-center gap-1 pointer-events-auto">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                mapType === 'satellite'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">satellite_alt</span>
              <span>Satélite</span>
            </button>
            <button
              onClick={() => setMapType('street')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                mapType === 'street'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>Vetor</span>
            </button>
            <button
              onClick={() => setShowSatelliteGuide(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-on-surface hover:bg-surface-container transition-colors"
              title="Guia dos Prédios na Foto de Satélite"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span className="hidden sm:inline">Foto Satélite</span>
            </button>
          </div>

          {/* Real GPS Button */}
          <button
            onClick={() => {
              setUseRealGps(!useRealGps);
              if (!useRealGps) {
                setSimulating(false);
              }
            }}
            className={`pointer-events-auto px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all border ${
              useRealGps
                ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                : 'bg-surface-container-lowest/90 backdrop-blur-md text-on-surface border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {useRealGps ? 'gps_fixed' : 'gps_not_fixed'}
            </span>
            <span>{useRealGps ? 'GPS Ativo' : 'Ligar GPS'}</span>
          </button>
        </div>
      )}

      {/* Floating Right Map Buttons (Zoom & Recenter) */}
      <div className="absolute right-3 top-24 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-primary shadow-lg flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container active:scale-90 transition-transform"
          title="Centralizar na minha localização"
        >
          <span className="material-symbols-outlined text-[22px]">my_location</span>
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface shadow-lg flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container active:scale-90 transition-transform"
          title="Aumentar Zoom"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-on-surface shadow-lg flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container active:scale-90 transition-transform"
          title="Diminuir Zoom"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
      </div>

      {/* Building Info Card Modal when tapped */}
      {selectedBuilding && (
        <div className="absolute inset-x-3 bottom-24 z-30 animate-in slide-in-from-bottom-3">
          <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-outline-variant/30 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary bg-secondary-container px-2 py-0.5 rounded-md">
                  {selectedBuilding.category}
                </span>
                <h4 className="font-display font-bold text-sm text-on-surface mt-1">
                  {selectedBuilding.name}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {selectedBuilding.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="text-outline hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (onNavigateToRotas) onNavigateToRotas(selectedBuilding.name);
                  setSelectedBuilding(null);
                }}
                className="flex-1 bg-primary text-on-primary py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">directions</span>
                <span>Traçar rota para cá</span>
              </button>
              <button
                onClick={() => {
                  mapInstanceRef.current?.setView(
                    [selectedBuilding.center.lat, selectedBuilding.center.lng],
                    19,
                    { animate: true }
                  );
                }}
                className="bg-surface-container text-on-surface py-2 px-3 rounded-xl text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Focar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION HUD - Live advancing status bar (Google Maps Navigation Style) */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-outline-variant/30 pointer-events-auto flex flex-col gap-2.5">
          {navigating ? (
            /* Active Live Navigation Controls */
            <div className="flex flex-col gap-2.5">
              {/* ETA, Remaining Dist, and Speed Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-xl text-primary">
                    {remainingMinutes} min
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    ({remainingMeters} m)
                  </span>
                  <span className="text-xs text-outline">
                    • Chegada: {new Date(Date.now() + remainingMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Speedometer Badge */}
                <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[15px] text-primary">speed</span>
                  <span>{userSpeed.toFixed(1)} km/h</span>
                </div>
              </div>

              {/* Progress Slider (Visualizing Real-time Advancement) */}
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden relative">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentWaypointIndex + 1) / ROUTE_WAYPOINTS_DETAILED.length) * 100}%`,
                  }}
                />
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Simulation speed multiplier buttons (1x, 2x, 4x) */}
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl">
                  <button
                    onClick={() => setSimulating(!simulating)}
                    className="p-1.5 rounded-lg bg-surface-container-lowest text-primary font-bold text-xs shadow-xs"
                    title={simulating ? 'Pausar avanço' : 'Continuar avanço'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {simulating ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  {[1, 2, 4].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setSimSpeedMultiplier(mult)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        simSpeedMultiplier === mult
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecenter}
                    className="px-3 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center gap-1 hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    <span>Recentralizar</span>
                  </button>

                  {/* End Navigation Button */}
                  <button
                    onClick={handleStopNavigation}
                    className="px-4 py-2 rounded-xl bg-error text-on-error font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    <span>Encerrar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standby Card: Destination Preview & Iniciar Navegação */
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">navigation</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wide">
                    Destino Ativo
                  </span>
                  <span className="text-xs font-bold text-on-surface truncate">
                    {initialDestination}
                  </span>
                  <span className="text-[11px] text-secondary font-semibold">
                    180m • ~3 min a pé via Passarela Coberta
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartNavigation}
                className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Iniciar Navegação</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SATELLITE PHOTO GUIDE MODAL */}
      {showSatelliteGuide && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-4 shadow-2xl border border-outline-variant/30 flex flex-col gap-3.5 my-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-on-surface">
                    Foto de Satélite Oficial (IFAP Macapá)
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Identificação direta dos prédios e áreas da foto aérea
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSatelliteGuide(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* List of identified buildings on satellite image */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[55vh] pr-1">
              {CAMPUS_BUILDINGS_GEO.map((building) => (
                <div
                  key={building.id}
                  className="p-2.5 rounded-xl border border-outline-variant/25 hover:border-primary/50 bg-surface-container-low/60 hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white/50 shadow-xs"
                      style={{ backgroundColor: building.fillColor }}
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-on-surface truncate">
                          {building.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant uppercase">
                          {building.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                        {building.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowSatelliteGuide(false);
                      setSelectedBuilding(building);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView(
                          [building.center.lat, building.center.lng],
                          19,
                          { animate: true }
                        );
                      }
                      onShowToast(`Centralizado em: ${building.name}`, 'pin_drop');
                    }}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-on-primary text-primary text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">my_location</span>
                    <span>Ver no Mapa</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
              <span className="text-[11px] text-outline">
                Orientação: Norte acima (R. Prof. Glaura Regina)
              </span>
              <button
                onClick={() => setShowSatelliteGuide(false)}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Voltar ao Mapa GPS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
