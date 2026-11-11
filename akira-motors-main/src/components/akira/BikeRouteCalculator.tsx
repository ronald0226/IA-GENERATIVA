import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Fuel,
  Clock,
  Milestone,
  Compass,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  CircleDollarSign,
} from "lucide-react";
import type { Bike } from "./data";
import {
  calculateTripMetrics,
  POPULAR_LOCATIONS,
  SCENIC_ROUTES,
  estimateRoadDistanceKm,
  resolveColombianLocation,
  type RidingMode,
} from "./logic";
import { sound } from "./engineSound";

interface BikeRouteCalculatorProps {
  bike: Bike;
}

interface Coords {
  lat: number;
  lng: number;
}

// Inner Google Maps Route Renderer component
function GoogleMapRouteRenderer({
  originText,
  destText,
  originCoords,
  destCoords,
  onRouteCalculated,
}: {
  originText: string;
  destText: string;
  originCoords: Coords;
  destCoords: Coords;
  onRouteCalculated: (
    distKm: number,
    durationMin: number,
    start?: Coords,
    end?: Coords
  ) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // Fit map bounds to origin and destination
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(originCoords);
    bounds.extend(destCoords);
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    // Helper: draw an immediate smooth driving polyline between coordinates
    const drawFallbackRoadPolyline = () => {
      const p1 = originCoords;
      const p2 = destCoords;
      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;
      const deltaLat = p2.lat - p1.lat;
      const deltaLng = p2.lng - p1.lng;
      const curveFactor = 0.08;
      const offsetLat = -deltaLng * curveFactor;
      const offsetLng = deltaLat * curveFactor;

      const curvePath = [
        p1,
        {
          lat: p1.lat + deltaLat * 0.25 + offsetLat * 0.7,
          lng: p1.lng + deltaLng * 0.25 + offsetLng * 0.7,
        },
        { lat: midLat + offsetLat, lng: midLng + offsetLng },
        {
          lat: p1.lat + deltaLat * 0.75 + offsetLat * 0.5,
          lng: p1.lng + deltaLng * 0.75 + offsetLng * 0.5,
        },
        p2,
      ];

      const fallbackPolyline = new google.maps.Polyline({
        path: curvePath,
        strokeColor: "#E5173E",
        strokeWeight: 5,
        strokeOpacity: 0.95,
        map,
      });

      polylinesRef.current.push(fallbackPolyline);

      const estimatedKm = estimateRoadDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
      const estimatedMin = Math.round((estimatedKm / 75) * 60);
      onRouteCalculated(estimatedKm, estimatedMin, p1, p2);
    };

    // If Routes library is not yet ready, draw fallback immediately so user sees the route
    if (!routesLib || !routesLib.Route) {
      drawFallbackRoadPolyline();
      return;
    }

    try {
      const originParam =
        originCoords && originCoords.lat
          ? { lat: originCoords.lat, lng: originCoords.lng }
          : originText;
      const destParam =
        destCoords && destCoords.lat
          ? { lat: destCoords.lat, lng: destCoords.lng }
          : destText;

      const request = {
        origin: originParam,
        destination: destParam,
        travelMode: "DRIVING",
        fields: ["path", "distanceMeters", "durationMillis", "viewport", "legs"],
      };

      (routesLib.Route as any)
        .computeRoutes(request)
        .then(({ routes }: { routes: any[] }) => {
          if (!routes || routes.length === 0) {
            drawFallbackRoadPolyline();
            return;
          }

          const primaryRoute = routes[0];

          // Clear initial fallback and render live road polyline
          polylinesRef.current.forEach((p) => p.setMap(null));
          polylinesRef.current = [];

          if (typeof primaryRoute.createPolylines === "function") {
            const newPolylines = primaryRoute.createPolylines();
            newPolylines.forEach((poly: google.maps.Polyline) => {
              poly.setOptions({
                strokeColor: "#E5173E",
                strokeWeight: 5,
                strokeOpacity: 0.95,
              });
              poly.setMap(map);
            });
            polylinesRef.current = newPolylines;
          } else if (primaryRoute.path) {
            const pathPolyline = new google.maps.Polyline({
              path: primaryRoute.path,
              strokeColor: "#E5173E",
              strokeWeight: 5,
              strokeOpacity: 0.95,
              map,
            });
            polylinesRef.current = [pathPolyline];
          } else {
            drawFallbackRoadPolyline();
          }

          if (primaryRoute.viewport) {
            map.fitBounds(primaryRoute.viewport, {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            });
          }

          if (primaryRoute.distanceMeters && primaryRoute.durationMillis) {
            const distKm = Number((primaryRoute.distanceMeters / 1000).toFixed(1));
            const durMin = Math.round(primaryRoute.durationMillis / 60000);

            // Extract exact polyline start and end coordinates to prevent any marker offset
            const extractPoint = (pt: any): Coords | null => {
              if (!pt) return null;
              if (typeof pt.lat === "function" && typeof pt.lng === "function") {
                return { lat: pt.lat(), lng: pt.lng() };
              }
              if (typeof pt.lat === "number" && typeof pt.lng === "number") {
                return { lat: pt.lat, lng: pt.lng };
              }
              if (pt.latLng) {
                const lat = pt.latLng.latitude ?? pt.latLng.lat;
                const lng = pt.latLng.longitude ?? pt.latLng.lng;
                if (typeof lat === "number" && typeof lng === "number") {
                  return { lat, lng };
                }
              }
              return null;
            };

            let exactStart: Coords | undefined = undefined;
            let exactEnd: Coords | undefined = undefined;

            if (primaryRoute.legs && primaryRoute.legs.length > 0) {
              const leg = primaryRoute.legs[0];
              const s = extractPoint(leg.startLocation || leg.start_location);
              const e = extractPoint(leg.endLocation || leg.end_location);
              if (s) exactStart = s;
              if (e) exactEnd = e;
            }
            if (!exactStart && primaryRoute.path && primaryRoute.path.length > 0) {
              const s = extractPoint(primaryRoute.path[0]);
              if (s) exactStart = s;
            }
            if (!exactEnd && primaryRoute.path && primaryRoute.path.length > 0) {
              const e = extractPoint(primaryRoute.path[primaryRoute.path.length - 1]);
              if (e) exactEnd = e;
            }

            onRouteCalculated(distKm, durMin, exactStart, exactEnd);
          }
        })
        .catch(() => {
          drawFallbackRoadPolyline();
        });
    } catch {
      drawFallbackRoadPolyline();
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    map,
    routesLib,
    originText,
    destText,
    originCoords.lat,
    originCoords.lng,
    destCoords.lat,
    destCoords.lng,
  ]);

  return null;
}

export function BikeRouteCalculator({ bike }: BikeRouteCalculatorProps) {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";

  // Tabs: Predefined (4 routes) vs Custom Destination
  const [routeTab, setRouteTab] = useState<"presets" | "custom">("presets");

  // Custom origin and destination inputs
  const [customOriginInput, setCustomOriginInput] = useState("Bogotá, Colombia");
  const [customDestInput, setCustomDestInput] = useState("Villa de Leyva, Boyacá");
  const [activeOriginText, setActiveOriginText] = useState("Bogotá");
  const [activeDestText, setActiveDestText] = useState("Villa de Leyva");

  // Coordinates
  const [originCoords, setOriginCoords] = useState<Coords>(POPULAR_LOCATIONS["Bogotá"]);
  const [destCoords, setDestCoords] = useState<Coords>(POPULAR_LOCATIONS["Villa de Leyva"]);
  const [actualStartCoords, setActualStartCoords] = useState<Coords | null>(null);
  const [actualEndCoords, setActualEndCoords] = useState<Coords | null>(null);

  // Modes & Distance
  const [ridingMode, setRidingMode] = useState<RidingMode>("touring");
  const [distanceKm, setDistanceKm] = useState<number>(165);

  // Ride Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Handle calculate button for custom user input
  const handleCalculateCustomRoute = () => {
    sound.playMechanicalClick();
    const orig = customOriginInput.trim();
    const dest = customDestInput.trim();

    if (!orig || !dest) return;

    setActiveOriginText(orig);
    setActiveDestText(dest);

    // Try resolving coordinates using our smart Colombian location resolver
    const foundOrig = resolveColombianLocation(orig);
    const foundDest = resolveColombianLocation(dest);

    const nextOrigCoords = foundOrig ? { lat: foundOrig.lat, lng: foundOrig.lng } : originCoords;
    const nextDestCoords = foundDest ? { lat: foundDest.lat, lng: foundDest.lng } : destCoords;

    if (foundOrig) setOriginCoords(nextOrigCoords);
    if (foundDest) setDestCoords(nextDestCoords);

    const estimated = estimateRoadDistanceKm(
      nextOrigCoords.lat,
      nextOrigCoords.lng,
      nextDestCoords.lat,
      nextDestCoords.lng
    );
    setDistanceKm(Math.max(15, estimated));

    setSimProgress(0);
    setIsSimulating(false);
    setActualStartCoords(null);
    setActualEndCoords(null);
    sound.stopAllAudio();
  };

  // When selecting one of the 4 predefined routes
  const handlePresetSelect = (route: (typeof SCENIC_ROUTES)[0]) => {
    sound.playMechanicalClick();
    setCustomOriginInput(route.origin);
    setCustomDestInput(route.destination);
    setActiveOriginText(route.origin);
    setActiveDestText(route.destination);

    const origLoc = POPULAR_LOCATIONS[route.origin] || originCoords;
    const destLoc = POPULAR_LOCATIONS[route.destination] || destCoords;
    setOriginCoords(origLoc);
    setDestCoords(destLoc);
    setActualStartCoords(null);
    setActualEndCoords(null);
    setDistanceKm(route.distanceKm);
    setSimProgress(0);
    setIsSimulating(false);
    sound.stopAllAudio();
  };

  // Telemetry calculation with exact motorcycle attributes
  const tripMetrics = calculateTripMetrics(
    distanceKm,
    bike.fuelConsumptionLPer100Km,
    bike.tankCapacityLiters,
    ridingMode
  );

  // Simulation handler with REAL audio from the motorcycle
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            sound.stopAllAudio();
            return 100;
          }
          return prev + 1;
        });
      }, 150);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  const handleStartSimulation = () => {
    sound.playMechanicalClick();
    if (!isSimulating) {
      if (simProgress >= 100) {
        setSimProgress(0);
      }
      setIsSimulating(true);
      sound.toggleRealEngineSound(bike.audioSrc, 0.9);
    } else {
      setIsSimulating(false);
      sound.stopAllAudio();
    }
  };

  const handleResetSimulation = () => {
    sound.playMechanicalClick();
    setIsSimulating(false);
    setSimProgress(0);
    sound.stopAllAudio();
  };

  const simulatedKmElapsed = Math.round((simProgress / 100) * tripMetrics.distanceKm);
  const currentTankPercent = Math.max(
    0,
    Math.round(100 - (simProgress / 100) * tripMetrics.tankPercentage)
  );

  return (
    <section className="py-12 border-t-2 border-border/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-none border border-primary/40 bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-2">
            <Compass size={14} className="animate-spin text-primary" />
            TELEMETRÍA EN RUTA · GOOGLE MAPS PLATFORM
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-foreground leading-tight">
            Calculadora de Ruta & Autonomía
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium max-w-2xl">
            Simula tu trayecto por las carreteras de Colombia con la telemetría oficial de la{" "}
            <strong className="text-foreground">{bike.name}</strong>. Estimación de combustible,
            autonomía de tanque y tiempo real de viaje.
          </p>
        </div>

        {/* Riding Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Modo de Conducción:
          </span>
          <div className="inline-flex p-1 rounded-none border-2 border-border bg-card">
            {(["eco", "touring", "sport"] as RidingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  sound.playMechanicalClick();
                  setRidingMode(mode);
                }}
                className={`px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  ridingMode === mode
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "eco" ? "Eco (-12%)" : mode === "sport" ? "Sport (+15%)" : "Touring"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route Mode Tabs: 4 Scenic Routes vs Custom Search */}
      <div className="flex border-b-2 border-border/80 mb-6">
        <button
          type="button"
          onClick={() => {
            sound.playMechanicalClick();
            setRouteTab("presets");
          }}
          className={`py-3 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-[2px] rounded-none ${
            routeTab === "presets"
              ? "border-primary text-primary font-black bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Milestone size={16} /> 4 Rutas Legendarias de Colombia
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playMechanicalClick();
            setRouteTab("custom");
          }}
          className={`py-3 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-[2px] rounded-none ${
            routeTab === "custom"
              ? "border-primary text-primary font-black bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search size={16} /> Ruta Personalizada
        </button>
      </div>

      {/* Preset Route Selectors */}
      {routeTab === "presets" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {SCENIC_ROUTES.map((route) => {
            const isSelected =
              activeOriginText === route.origin && activeDestText === route.destination;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => handlePresetSelect(route)}
                className={`p-4 rounded-none border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg ring-1 ring-primary"
                    : "border-border bg-card hover:border-foreground/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-background border border-border text-primary font-bold">
                      {route.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <Check size={12} /> Activa
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-black text-foreground uppercase leading-tight">
                    {route.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-primary shrink-0" />
                    <span>{route.origin}</span>
                    <span>→</span>
                    <span>{route.destination}</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-foreground">{route.distanceKm} km</span>
                  <span className="text-muted-foreground">{route.durationMinutes} min aprox</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-5 rounded-none border-2 border-border bg-card mb-6">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-3">
            Ingresa tu punto de partida y destino en Colombia:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1 font-bold">
                Punto de Origen:
              </label>
              <input
                type="text"
                value={customOriginInput}
                onChange={(e) => setCustomOriginInput(e.target.value)}
                placeholder="Ej: Bogotá, Medellín, Cali, Tunja..."
                className="w-full rounded-none border-2 border-input bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1 font-bold">
                Punto de Destino:
              </label>
              <input
                type="text"
                value={customDestInput}
                onChange={(e) => setCustomDestInput(e.target.value)}
                placeholder="Ej: Villa de Leyva, Santa Marta, Guatapé, Neiva..."
                className="w-full rounded-none border-2 border-input bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleCalculateCustomRoute}
                className="w-full md:w-auto h-[42px] clip-cyber inline-flex items-center justify-center gap-2 px-6 bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary-deep transition-all cursor-pointer shadow-md"
              >
                <Compass size={15} /> Trazar Ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Map & Telemetry Split */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
        {/* Map View Container - Sharp Borders */}
        <div className="relative rounded-none overflow-hidden border-2 border-border shadow-md bg-slate-950 flex flex-col min-h-[400px]">
          <APIProvider apiKey={apiKey}>
            <GoogleMap
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              style={{ width: "100%", height: "100%", minHeight: "400px" }}
              defaultCenter={originCoords}
              defaultZoom={7}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              <GoogleMapRouteRenderer
                originText={activeOriginText}
                destText={activeDestText}
                originCoords={originCoords}
                destCoords={destCoords}
                onRouteCalculated={(km, _dur, start, end) => {
                  setDistanceKm(km);
                  if (start) setActualStartCoords(start);
                  if (end) setActualEndCoords(end);
                }}
              />
              {/* Marcador de Origen con nombre de ubicación y anclaje exacto al inicio de la ruta */}
              <AdvancedMarker
                position={actualStartCoords || originCoords}
                anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM_CENTER}
                title={`Origen: ${activeOriginText}`}
              >
                <div className="flex flex-col items-center select-none pointer-events-auto filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 bg-slate-950/95 border-2 border-emerald-500 px-2.5 py-1.5 rounded-none text-white font-mono shadow-2xl backdrop-blur-md">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-emerald-500 text-[11px] font-black text-black">
                      A
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 leading-none">
                        ORIGEN
                      </span>
                      <span className="text-xs font-black text-white leading-tight truncate max-w-[140px] sm:max-w-[180px]">
                        {activeOriginText}
                      </span>
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-500 -mt-[1px]" />
                </div>
              </AdvancedMarker>

              {/* Marcador de Destino con nombre de ubicación y anclaje exacto al fin de la ruta */}
              <AdvancedMarker
                position={actualEndCoords || destCoords}
                anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM_CENTER}
                title={`Destino: ${activeDestText}`}
              >
                <div className="flex flex-col items-center select-none pointer-events-auto filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 bg-slate-950/95 border-2 border-primary px-2.5 py-1.5 rounded-none text-white font-mono shadow-2xl backdrop-blur-md">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-primary text-[11px] font-black text-white">
                      B
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary leading-none">
                        DESTINO
                      </span>
                      <span className="text-xs font-black text-white leading-tight truncate max-w-[140px] sm:max-w-[180px]">
                        {activeDestText}
                      </span>
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary -mt-[1px]" />
                </div>
              </AdvancedMarker>
            </GoogleMap>
          </APIProvider>

          {/* Clean HUD Badge - Sharp Hard Edges */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-none bg-slate-900/95 backdrop-blur-md border-2 border-slate-700/80 text-white text-xs font-mono flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-none bg-emerald-500" />
              <span className="truncate max-w-[130px] font-bold">{activeOriginText}</span>
              <span className="text-slate-400">→</span>
              <span className="text-primary font-bold truncate max-w-[130px]">{activeDestText}</span>
              <span className="ml-1 text-slate-300 font-bold border-l border-slate-700 pl-2">
                {tripMetrics.distanceKm} km
              </span>
            </div>
          </div>

          {/* Simulation Progress Overlay - Sharp Hard Edges */}
          {isSimulating && (
            <div className="absolute bottom-3 left-3 right-3 z-10 p-3 rounded-none bg-slate-900/95 border-2 border-primary/50 backdrop-blur-md text-white shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-primary font-bold">
                  En ruta: {simulatedKmElapsed} / {tripMetrics.distanceKm} km
                </span>
                <span>Tanque restante: {currentTankPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-none overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-100 rounded-none"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Real Telemetry Dashboard Calculated for This Specific Bike */}
        <div className="flex flex-col justify-between gap-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Distancia Total */}
            <div className="p-4 rounded-none border-2 border-border bg-background/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase font-bold">
                <Milestone size={14} className="text-primary" /> Distancia Total
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-foreground mt-1">
                {tripMetrics.distanceKm}{" "}
                <span className="text-sm font-sans font-bold text-muted-foreground">km</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Recorrido total en ruta</p>
            </div>

            {/* Tiempo Estimado */}
            <div className="p-4 rounded-none border-2 border-border bg-background/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase font-bold">
                <Clock size={14} className="text-amber-400" /> Tiempo Estimado
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-foreground mt-1">
                {tripMetrics.durationFormatted}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Velocidad promedio vial</p>
            </div>

            {/* Gasolina Requerida */}
            <div className="p-4 rounded-none border-2 border-border bg-background/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase font-bold">
                <Fuel size={14} className="text-primary" /> Combustible
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-foreground mt-1">
                {tripMetrics.litersRequired}{" "}
                <span className="text-sm font-sans font-bold text-muted-foreground">L</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {tripMetrics.gallonsRequired} galones
              </p>
            </div>

            {/* Costo Estimado */}
            <div className="p-4 rounded-none border-2 border-border bg-background/80">
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground uppercase font-bold">
                <CircleDollarSign size={14} className="text-emerald-400" /> Costo Estimado
              </div>
              <div className="font-display text-xl sm:text-2xl font-black text-emerald-500 mt-1">
                ${tripMetrics.estimatedCostCop.toLocaleString("es-CO")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pesos colombianos (COP)</p>
            </div>
          </div>

          {/* Tank Autonomy Card - Sharp Borders */}
          <div className="p-4 rounded-none border-2 border-border bg-background/90">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground mb-2">
              <span className="flex items-center gap-1 text-foreground">
                <Fuel size={13} className="text-primary" /> Tanque: {bike.tankCapacityLiters} L
              </span>
              <span className="text-primary font-black">
                {tripMetrics.tankPercentage}% del tanque
              </span>
            </div>

            {/* Visual Progress Bar of Fuel Tank */}
            <div className="w-full bg-secondary h-3 rounded-none overflow-hidden p-0.5 border border-border">
              <div
                className={`h-full rounded-none transition-all duration-300 ${
                  tripMetrics.tankPercentage <= 70
                    ? "bg-emerald-500"
                    : tripMetrics.tankPercentage <= 100
                    ? "bg-amber-400"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, tripMetrics.tankPercentage)}%` }}
              />
            </div>

            {/* Autonomy Verdict Message */}
            <div className="mt-3 flex items-start gap-2 text-xs">
              {tripMetrics.reachesWithoutRefuel ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-none border border-emerald-500/20 w-full">
                  <span className="w-2 h-2 rounded-none bg-emerald-500 shrink-0" />
                  <span>
                    ¡Autonomía garantizada! Llegas con 1 solo tanque lleno (
                    {tripMetrics.remainingLitersInTank} L de reserva).
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-none border border-amber-500/20 w-full">
                  <AlertTriangle size={15} className="shrink-0 text-amber-400" />
                  <span>
                    Ruta extensa: Necesitas {tripMetrics.refuelStopsNeeded} parada(s) de repostaje
                    en el camino.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Simulation Action Buttons (Uses REAL engine audio of this bike) */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartSimulation}
              className={`flex-1 clip-cyber inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-md ${
                isSimulating
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-primary hover:bg-primary-deep"
              }`}
            >
              <Play size={14} className={isSimulating ? "animate-pulse" : ""} />
              {isSimulating ? "Pausar Simulación" : `Simular Trayecto (${bike.name})`}
            </button>

            {simProgress > 0 && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-3.5 py-3 rounded-none border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
                title="Reiniciar simulación"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
