import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, RefreshCw, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { LANG_NAMES_FOR_AI } from "@/lib/translations";
import { LocationBar } from "@/components/climate/LocationBar";
import {
  AdvisorPanel, FarmPanel, MapsPanel, NowPanel, RainPanel, TrendsPanel,
} from "@/components/climate/panels";
import { getClimateAdvice, type ClimateAdvice } from "@/lib/climate.functions";
import {
  deriveAlerts, fetchClimate, readCache, readPlaces, reverseName, REFRESH_MS, ROOF_KEY,
  writeCache, writePlaces, type ClimateSnapshot, type GeoPlace,
} from "@/lib/climate";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Climate Intelligence — Jala Rakshana" },
      {
        name: "description",
        content:
          "Live weather, rainfall monitoring, climate risk alerts, smart agriculture advisories and rainwater harvesting guidance for your location.",
      },
      { property: "og:title", content: "Climate Intelligence — Jala Rakshana" },
      {
        property: "og:description",
        content: "Real-time weather, rainfall trends and AI water & farming advisories in 9 Indian languages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClimatePage,
});

const TABS = [
  { id: "now", key: "tab_now" },
  { id: "rain", key: "tab_rain" },
  { id: "advisor", key: "tab_advisor" },
  { id: "farm", key: "tab_farm" },
  { id: "maps", key: "tab_maps" },
  { id: "trends", key: "tab_trends" },
] as const;

const DEFAULT_PLACE: GeoPlace = { id: "default-delhi", name: "New Delhi", admin: "Delhi", country: "India", lat: 28.6139, lon: 77.209 };

function seasonOf(d = new Date()) {
  const m = d.getMonth() + 1;
  if (m <= 2) return "Winter";
  if (m <= 5) return "Summer / pre-monsoon";
  if (m <= 9) return "Southwest monsoon";
  return "Post-monsoon / retreating monsoon";
}

function ClimatePage() {
  const { t, lang, notifications } = useI18n();
  const advise = useServerFn(getClimateAdvice);

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("now");
  const [place, setPlace] = useState<GeoPlace | null>(null);
  const [places, setPlaces] = useState<GeoPlace[]>([]);
  const [snap, setSnap] = useState<ClimateSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [roofArea, setRoofArea] = useState(100);
  const [advice, setAdvice] = useState<ClimateAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [layer, setLayer] = useState("rain");
  const notified = useRef<string>("");

  // hydrate from storage
  useEffect(() => {
    setPlaces(readPlaces());
    const roof = Number(localStorage.getItem(ROOF_KEY));
    if (roof > 0) setRoofArea(roof);
    const cached = readCache();
    if (cached) {
      setSnap(cached);
      setPlace(cached.place);
      setOffline(true);
    } else {
      detect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem(ROOF_KEY, String(roofArea)); } catch { /* ignore */ }
  }, [roofArea]);

  const load = useCallback(async (p: GeoPlace) => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchClimate(p);
      setSnap(s);
      setOffline(false);
      writeCache(s);
      setAdvice(null);
    } catch {
      setError(t("offline_data"));
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const pick = useCallback((p: GeoPlace) => {
    setPlace(p);
    load(p);
  }, [load]);

  function detect() {
    if (!("geolocation" in navigator)) {
      pick(DEFAULT_PLACE);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const name = await reverseName(lat, lon);
        pick({ id: `geo-${lat.toFixed(3)}-${lon.toFixed(3)}`, name, lat, lon });
      },
      () => pick(DEFAULT_PLACE),
      { timeout: 8000 },
    );
  }

  // auto refresh every 15 minutes
  useEffect(() => {
    if (!place) return;
    const id = setInterval(() => load(place), REFRESH_MS);
    return () => clearInterval(id);
  }, [place, load]);

  const alerts = snap ? deriveAlerts(snap) : [];

  // Browser notification for high-severity alerts (if enabled in settings)
  useEffect(() => {
    if (!notifications || typeof Notification === "undefined" || !snap) return;
    const high = alerts.filter((a) => a.severity === "high");
    if (high.length === 0) return;
    const sig = `${snap.place.id}:${high.map((h) => h.id).join(",")}`;
    if (notified.current === sig) return;
    notified.current = sig;
    const fire = () =>
      high.forEach((h) =>
        new Notification(`Jala Rakshana — ${h.title}`, { body: h.detail, icon: "/favicon.ico" }),
      );
    if (Notification.permission === "granted") fire();
    else if (Notification.permission === "default") Notification.requestPermission().then((p) => p === "granted" && fire());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, notifications]);

  async function generateAdvice() {
    if (!snap) return;
    setAdviceLoading(true);
    try {
      const res = await advise({
        data: {
          languageName: LANG_NAMES_FOR_AI[lang],
          place: `${snap.place.name}${snap.place.admin ? ", " + snap.place.admin : ""}`,
          season: seasonOf(),
          temperature: Math.round(snap.current.temperature),
          humidity: Math.round(snap.current.humidity),
          rainToday: Number(snap.daily.precipitation_sum[0] ?? 0),
          rainWeek: Number(snap.daily.precipitation_sum.slice(0, 7).reduce((a, b) => a + b, 0).toFixed(1)),
          windSpeed: Math.round(snap.current.windSpeed),
          uv: Number(snap.current.uv.toFixed(1)),
          aqi: snap.air.aqi,
          alerts: alerts.map((a) => `${a.title}: ${a.detail}`),
          roofArea,
        },
      });
      if (res.ok) setAdvice(res.advice);
      else setError(t(res.error === "rate_limited" ? "rate_limited" : res.error === "no_credits" ? "no_credits" : "error_generic"));
    } catch {
      setError(t("error_generic"));
    } finally {
      setAdviceLoading(false);
    }
  }

  function savePlace() {
    if (!place) return;
    const exists = places.some((p) => p.id === place.id);
    const next = exists ? places.filter((p) => p.id !== place.id) : [...places, place].slice(-8);
    setPlaces(next);
    writePlaces(next);
  }

  function removePlace(id: string) {
    const next = places.filter((p) => p.id !== id);
    setPlaces(next);
    writePlaces(next);
  }

  return (
    <div>
      <PageHeader
        title={t("climate_title")}
        subtitle={place ? `${place.name}${place.admin ? ", " + place.admin : ""}` : t("detecting")}
        icon={CloudSun}
      />
      <main className="px-4 py-4 space-y-4">
        <LocationBar
          place={place}
          places={places}
          onPick={pick}
          onDetect={detect}
          onSave={savePlace}
          onRemove={removePlace}
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {offline && <WifiOff className="size-3" />}
            {snap
              ? `${offline ? t("offline_data") : t("last_updated")} · ${new Date(snap.fetchedAt).toLocaleTimeString()}`
              : t("loading")}
          </span>
          <button
            onClick={() => place && load(place)}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} /> {t("refresh")}
          </button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium shrink-0 transition ${
                tab === tb.id ? "bg-hero text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(tb.key)}
            </button>
          ))}
        </div>

        {!snap ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : tab === "now" ? (
          <NowPanel s={snap} alerts={alerts} />
        ) : tab === "rain" ? (
          <RainPanel s={snap} roofArea={roofArea} setRoofArea={setRoofArea} />
        ) : tab === "advisor" ? (
          <AdvisorPanel advice={advice} loading={adviceLoading} onGenerate={generateAdvice} alerts={alerts} />
        ) : tab === "farm" ? (
          <FarmPanel s={snap} advice={advice} loading={adviceLoading} onGenerate={generateAdvice} />
        ) : tab === "maps" ? (
          <MapsPanel s={snap} layer={layer} setLayer={setLayer} />
        ) : (
          <TrendsPanel s={snap} />
        )}
      </main>
    </div>
  );
}
