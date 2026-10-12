import { useState, useEffect } from "react";
import { LocateFixed, MapPin, Check, Search, Map } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "sonner";
import { getCurrentPositionWithFallback, reverseGeocodeCoords } from "@/lib/locationUtils";

// Fix Leaflet's default icon path issues with bundlers
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: "gps" | "manual";
  address?: string;
};

type Props = {
  value: LocationData | null;
  onChange: (loc: LocationData) => void;
};

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function MapPicker({
  pos,
  onSelect,
}: {
  pos: [number, number];
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={pos} />;
}

export function LocationSelector({ value, onChange }: Props) {
  const [mode, setMode] = useState<"gps" | "manual">("gps");
  const [status, setStatus] = useState<string | null>(null);

  // Default coordinates [lat, lng]
  const [mapPos, setMapPos] = useState<[number, number]>([
    value?.latitude || 18.5204,
    value?.longitude || 73.8567,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(16);
  const [mapConfirmed, setMapConfirmed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ lat: string; lon: string; display_name: string }[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update mapPos when value prop changes externally
  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      setMapPos([value.latitude, value.longitude]);
    }
  }, [value?.latitude, value?.longitude]);

  // Function to locate user and set map pin directly on user's exact current location
  const autoLocateUserOnMap = () => {
    if (value?.latitude && value?.longitude) {
      setMapPos([value.latitude, value.longitude]);
      setMapZoom(16);
      return;
    }

    setStatus("Locating your exact farm position...");
    getCurrentPositionWithFallback(
      async (coords) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const acc = coords.accuracy;

        setMapPos([lat, lng]);
        setMapZoom(16);
        setMapConfirmed(true);
        setStatus("Fetching farm address...");

        const res = await reverseGeocodeCoords(lat, lng);
        setStatus(`Pin placed at your location: ${res.cityState}`);

        onChange({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          source: "manual",
          address: res.fullAddress || res.cityState,
        });
      },
      (errorMsg) => {
        setStatus(errorMsg);
      }
    );
  };

  // Trigger auto-location whenever manual satellite mode is opened
  useEffect(() => {
    if (mode === "manual" && !value?.latitude) {
      autoLocateUserOnMap();
    }
  }, [mode]);

  // Handle Village/Taluka Search
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
          )}&countrycodes=in&format=json&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        /* ignore */
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function fetchGps() {
    setStatus("Detecting your farm location...");
    getCurrentPositionWithFallback(
      async (coords) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const acc = coords.accuracy;
        setStatus("Fetching farm address...");
        const res = await reverseGeocodeCoords(lat, lng);

        setMapPos([lat, lng]);
        setMapZoom(16);
        setStatus(`Detected: ${res.cityState}`);

        onChange({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          source: "gps",
          address: res.fullAddress || res.cityState,
        });
      },
      (errorMsg) => {
        setStatus(errorMsg);
      }
    );
  }

  async function handleMapClick(lat: number, lng: number) {
    setMapPos([lat, lng]);
    setMapConfirmed(true);
    setStatus("Fetching address...");
    const res = await reverseGeocodeCoords(lat, lng);

    onChange({
      latitude: lat,
      longitude: lng,
      accuracy: null,
      source: "manual",
      address: res.fullAddress || res.cityState,
    });
    setStatus(`Selected: ${res.cityState}`);
  }

  const handleSelectSuggestion = async (s: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setMapPos([lat, lng]);
    setMapZoom(16);
    setSearchQuery("");
    setSuggestions([]);
    setMapConfirmed(true);

    setStatus("Fetching address...");
    const res = await reverseGeocodeCoords(lat, lng);
    onChange({
      latitude: lat,
      longitude: lng,
      accuracy: null,
      source: "manual",
      address: res.fullAddress || res.cityState,
    });
    setStatus(`Selected: ${res.cityState}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex min-h-13 items-center gap-3 rounded-xl border border-border p-3 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            name="loc_mode"
            checked={mode === "gps"}
            onChange={() => {
              setMode("gps");
              setStatus(null);
            }}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          📍 Use My Current Location (GPS Auto Detect)
        </label>

        {mode === "gps" && (
          <div className="pl-1 animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={fetchGps}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary-soft px-4 text-sm font-bold text-primary-strong transition-colors hover:bg-primary-soft/80"
            >
              <LocateFixed className="h-4 w-4" />
              Detect Farm Location
            </button>
            {status && (
              <p className="mt-2 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg inline-block">
                {status}
              </p>
            )}
            {value?.source === "gps" && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary-strong">
                <Check className="h-4 w-4" /> Location detected successfully ({value.address})
              </p>
            )}
          </div>
        )}

        <label className="flex min-h-13 items-center gap-3 rounded-xl border border-border p-3 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            name="loc_mode"
            checked={mode === "manual"}
            onChange={() => {
              setMode("manual");
              setStatus(null);
              setMapConfirmed(false);
              autoLocateUserOnMap();
            }}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          🛰️ Select Farm on Satellite Map (Esri High-Res Satellite View)
        </label>

        {mode === "manual" && (
          <div className="pl-1 space-y-3 animate-in fade-in slide-in-from-top-2">
            {/* Search Box & Re-center Button */}
            <div className="flex gap-2 relative">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search village, taluka, city or farm landmark..."
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <button
                type="button"
                onClick={autoLocateUserOnMap}
                title="Pin My Location"
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-primary bg-primary-soft px-3 text-xs font-bold text-primary-strong hover:bg-primary-soft/80 transition-colors"
              >
                <LocateFixed className="h-4 w-4 text-primary-strong" />
                <span>My Location</span>
              </button>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card py-2 shadow-xl">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="flex cursor-pointer items-start gap-2.5 px-3.5 py-2 hover:bg-muted text-xs transition-colors"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" />
                      <span className="font-medium text-foreground">{s.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Satellite Map Container */}
            <div className="h-[360px] w-full rounded-2xl overflow-hidden border border-border shadow-md z-0 relative bg-slate-900">
              {isMounted && (
                <MapContainer
                  center={mapPos}
                  zoom={mapZoom}
                  maxZoom={19}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                >
                  {/* Esri World Imagery (Satellite) */}
                  <TileLayer
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                  />

                  {/* Esri Place Labels & Boundaries Overlay */}
                  <TileLayer
                    attribution=""
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                  />

                  <MapFlyTo center={mapPos} zoom={mapZoom} />

                  <MapPicker pos={mapPos} onSelect={handleMapClick} />
                </MapContainer>
              )}


            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-3 rounded-xl border border-border">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Click on your farm field</span> to drop a pin.
                {value?.address && (
                  <span className="text-primary-strong font-medium mt-0.5 block truncate max-w-md">
                    📍 {value.address}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!mapConfirmed}
                onClick={() => {
                  toast.success("Farm location confirmed!");
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50 transition-all hover:bg-primary-strong"
              >
                <Check className="h-4 w-4" /> Location Selected
              </button>
            </div>

            {status && (
              <p className="text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg">
                {status}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
