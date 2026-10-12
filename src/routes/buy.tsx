import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { LocateFixed, Search, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryStrip } from "@/components/CategoryStrip";
import { ListingCard } from "@/components/ListingCard";
import { Slider } from "@/components/ui/slider";
import { useLang } from "@/lib/i18n";
import { distanceKm, useListings, type Category } from "@/lib/listings";
import { getCurrentPositionWithFallback, reverseGeocodeCoords, formatPlaceName } from "@/lib/locationUtils";

type Search = { category?: Category | "all" };

export const Route = createFileRoute("/buy")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: (s["category"] as Category | "all") ?? "all",
  }),
  head: () => ({
    meta: [
      { title: "Buy Fresh Fruits Near You — FruitVyapar" },
      {
        name: "description",
        content:
          "Browse fresh mango, pomegranate, grapes and banana direct from verified farmers near your location on FruitVyapar.",
      },
      { property: "og:title", content: "Buy Fresh Fruits Near You — FruitVyapar" },
      {
        property: "og:description",
        content: "Distance-based search for farm-fresh fruit listings across India.",
      },
    ],
  }),
  component: BuyPage,
});

function BuyPage() {
  const { t } = useLang();
  const { listings, origin, setOrigin, refreshListings } = useListings();
  const { category: initialCategory } = Route.useSearch();
  const [category, setCategory] = useState<Category | "all">(initialCategory ?? "all");
  const [range, setRange] = useState(100);
  const [locQuery, setLocQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ lat: string; lon: string; display_name: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    if (locQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locQuery)}&countrycodes=in&format=json&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [locQuery]);

  const results = useMemo(() => {
    return listings
      .map((l) => ({ listing: l, distance: distanceKm(origin, l) }))
      .filter((r) => r.distance <= range)
      .filter((r) => category === "all" || r.listing.category === category)
      .sort((a, b) => a.distance - b.distance);
  }, [listings, origin, range, category]);

  function useMyLocation() {
    setStatus(t("locating"));
    getCurrentPositionWithFallback(
      async (coords) => {
        setStatus("Fetching location name...");
        const geocoded = await reverseGeocodeCoords(coords.latitude, coords.longitude);
        setOrigin({
          lat: coords.latitude,
          lng: coords.longitude,
          label: geocoded.cityState,
        });
        setStatus(null);
      },
      (errorMsg) => {
        setStatus(errorMsg);
      }
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("buyCardTitle")}</h1>

      <div className="mt-4 space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative">
          <button
            type="button"
            onClick={useMyLocation}
            className="flex-shrink-0 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary-strong transition-colors"
          >
            <LocateFixed className="h-4 w-4" />
            {t("useMyLocation")}
          </button>
          
          <div className="flex items-center justify-center opacity-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-[10px] font-bold">
              OR
            </span>
          </div>

          <div className="relative flex-1">
            <input
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              placeholder={t("searchLocation")}
              className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card py-2 shadow-lg">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      const cleanLabel = formatPlaceName(s.display_name);
                      setOrigin({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), label: cleanLabel });
                      setLocQuery("");
                      setSuggestions([]);
                    }}
                    className="flex cursor-pointer items-start gap-3 px-4 py-2 hover:bg-muted"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">{s.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {status && <p className="text-xs font-medium text-muted-foreground">{status}</p>}
        {origin.label && <p className="text-xs font-bold text-primary-strong">Location: {origin.label}</p>}

        <div className="pt-4 border-t border-border mt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>{t("rangeLabel")}</span>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {range} km
            </span>
          </div>
          <Slider
            value={[range]}
            min={5}
            max={300}
            step={5}
            onValueChange={(v) => setRange(v[0] ?? 100)}
            className="mt-4"
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>5 km</span>
            <span>300 km</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("showingWithin", { km: range })}</p>
        </div>
      </div>

      <div className="mt-4">
        <CategoryStrip value={category} onChange={setCategory} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {results.length} {t("results")}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 rounded-xl bg-card p-6 text-center space-y-3 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted-foreground">{t("noResults")}</p>
          {listings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setRange(150);
                setCategory("all");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary-strong hover:bg-primary/20 transition-colors"
            >
              Expand Search Distance (150 km) & Show All Fruits ({listings.length} available)
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <ListingCard key={r.listing.id} listing={r.listing} distance={r.distance} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
