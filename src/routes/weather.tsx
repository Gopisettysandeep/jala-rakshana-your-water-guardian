import { createFileRoute } from "@tanstack/react-router";
import { CloudSun, MapPin, Droplet, Wind, Thermometer, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather & Rain — Jala Rakshana" },
      { name: "description", content: "Live local weather, rainfall and water-saving guidance based on today's conditions." },
    ],
  }),
  component: WeatherPage,
});

interface Current {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  precipitation: number;
  weather_code: number;
}
interface Daily {
  time: string[];
  precipitation_sum: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
}

const CODE_MAP: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunder w/ hail", 99: "Thunder w/ heavy hail",
};

function describe(code: number) { return CODE_MAP[code] ?? "Weather"; }

function guidance(current: Current | null, daily: Daily | null) {
  if (!current || !daily) return "";
  const rainSoon = daily.precipitation_sum.slice(0, 3).some((v) => v > 2);
  if (current.precipitation > 0.2) return "It's raining — a perfect moment to set out buckets or check your rooftop harvesting inlet.";
  if (rainSoon) return "Rain expected in the next 3 days — clean gutters and prepare your harvesting tank now.";
  if (current.temperature_2m > 34) return "Hot day — water plants at dusk and reuse RO reject water to reduce demand.";
  return "Dry conditions — turn off idle taps and check for leaks. Every drop counts today.";
}

function WeatherPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<string>("");
  const [current, setCurrent] = useState<Current | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);

  async function loadFor(lat: number, lon: number, label?: string) {
    setLoading(true); setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("weather fetch failed");
      const json = await res.json();
      setCurrent(json.current);
      setDaily(json.daily);
      if (label) setPlace(label);
      else setPlace(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    } catch {
      setError("Couldn't load weather. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function detectLocation() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => loadFor(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => {
        setError("Location permission denied. Showing Delhi as fallback.");
        loadFor(28.6139, 77.209, "New Delhi (fallback)");
      },
      { timeout: 8000 },
    );
  }

  useEffect(() => { detectLocation(); /* eslint-disable-next-line */ }, []);

  return (
    <div>
      <PageHeader title="Weather & Rain" subtitle={place || "Detecting location…"} icon={CloudSun} />
      <main className="px-4 py-5 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={detectLocation}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-hero text-primary-foreground py-2 text-sm font-medium shadow-glow"
          >
            <MapPin className="size-4" /> Use my location
          </button>
          <button
            onClick={() => current && place && detectLocation()}
            className="inline-flex items-center justify-center rounded-2xl bg-secondary text-secondary-foreground px-3 py-2 text-sm"
            aria-label="Refresh"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {current && (
          <section className="glass rounded-3xl p-5">
            <p className="text-xs text-muted-foreground">Now — {describe(current.weather_code)}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{Math.round(current.temperature_2m)}°</span>
              <span className="text-sm text-muted-foreground">C</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Metric icon={Droplet} label="Humidity" value={`${Math.round(current.relative_humidity_2m)}%`} />
              <Metric icon={Wind} label="Wind" value={`${Math.round(current.wind_speed_10m)} km/h`} />
              <Metric icon={Thermometer} label="Rain now" value={`${current.precipitation} mm`} />
            </div>
          </section>
        )}

        {daily && (
          <section className="glass rounded-3xl p-5">
            <h3 className="text-sm font-semibold mb-3">Next 5 days</h3>
            <div className="space-y-2">
              {daily.time.slice(0, 5).map((d, idx) => (
                <div key={d} className="flex items-center justify-between text-sm">
                  <span className="w-16 text-muted-foreground">
                    {idx === 0 ? "Today" : new Date(d).toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                  <span className="flex-1 truncate px-2">{describe(daily.weather_code[idx])}</span>
                  <span className="text-xs text-muted-foreground w-14 text-right">{daily.precipitation_sum[idx]} mm</span>
                  <span className="w-16 text-right font-medium">
                    {Math.round(daily.temperature_2m_min[idx])}° / {Math.round(daily.temperature_2m_max[idx])}°
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {current && (
          <section className="glass rounded-3xl p-5">
            <h3 className="text-sm font-semibold">Water guidance</h3>
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{guidance(current, daily)}</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <Icon className="size-4 mx-auto text-primary" />
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
