// Climate Intelligence data layer — Open-Meteo (free, no API key), with offline caching.

export interface GeoPlace {
  id: string;
  name: string;
  admin?: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface ClimateCurrent {
  temperature: number;
  apparent: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDir: number;
  cloud: number;
  precipitation: number;
  weatherCode: number;
  isDay: number;
  uv: number;
  visibility: number;
}

export interface ClimateHourly {
  time: string[];
  precipitation: number[];
  precipitation_probability: number[];
  temperature_2m: number[];
}

export interface ClimateDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
}

export interface AirQuality {
  aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
}

export interface MonthlyRain {
  month: string;
  rain: number;
}

export interface ClimateSnapshot {
  place: GeoPlace;
  current: ClimateCurrent;
  hourly: ClimateHourly;
  daily: ClimateDaily;
  air: AirQuality;
  monthly: MonthlyRain[];
  fetchedAt: number;
}

export const CACHE_KEY = "jala-climate-cache";
export const PLACES_KEY = "jala-climate-places";
export const ROOF_KEY = "jala-climate-roof";
export const REFRESH_MS = 15 * 60 * 1000;

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Heavy freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm",
};

export function describeCode(code: number) {
  return WEATHER_CODES[code] ?? "Weather";
}

export function compass(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/** Rainwater collection potential in litres: rainfall(mm) x roof area(m2) x runoff coefficient. */
export function collectionPotential(rainMm: number, roofArea: number, coeff = 0.85) {
  return Math.round(rainMm * roofArea * coeff);
}

export function rainIntensity(mmPerHour: number) {
  if (mmPerHour <= 0) return "none";
  if (mmPerHour < 2.5) return "light";
  if (mmPerHour < 7.6) return "moderate";
  if (mmPerHour < 50) return "heavy";
  return "violent";
}

export function aqiLabelKey(aqi: number | null) {
  if (aqi == null) return "loading";
  if (aqi <= 40) return "aqi_good";
  if (aqi <= 80) return "aqi_moderate";
  if (aqi <= 130) return "aqi_poor";
  return "aqi_very_poor";
}

export interface RiskAlert {
  id: string;
  title: string;
  severity: "low" | "moderate" | "high";
  detail: string;
}

/** Derive live climate risk alerts from the snapshot (deterministic, offline-safe). */
export function deriveAlerts(s: ClimateSnapshot): RiskAlert[] {
  const a: RiskAlert[] = [];
  const d = s.daily;
  const next3 = d.precipitation_sum.slice(0, 3).reduce((x, y) => x + y, 0);
  const maxDay = Math.max(...d.precipitation_sum.slice(0, 7));
  const week = d.precipitation_sum.slice(0, 7).reduce((x, y) => x + y, 0);
  const maxWind = Math.max(...d.wind_speed_10m_max.slice(0, 3));
  const maxTemp = Math.max(...d.temperature_2m_max.slice(0, 3));
  const minTemp = Math.min(...d.temperature_2m_min.slice(0, 3));
  const storm = d.weather_code.slice(0, 3).some((c) => c >= 95);

  if (maxDay >= 64.5) a.push({ id: "heavy_rain", title: "Heavy Rain", severity: "high", detail: `Up to ${maxDay.toFixed(0)} mm expected in a single day.` });
  else if (maxDay >= 15) a.push({ id: "rain", title: "Rain Expected", severity: "low", detail: `Around ${maxDay.toFixed(0)} mm expected.` });
  if (next3 >= 120) a.push({ id: "flood", title: "Flood Risk", severity: "high", detail: `${next3.toFixed(0)} mm forecast over 3 days — low-lying areas at risk.` });
  if (maxWind >= 62 && maxDay >= 30) a.push({ id: "cyclone", title: "Cyclone Watch", severity: "high", detail: "Strong winds with heavy rain — monitor official bulletins." });
  else if (maxWind >= 40) a.push({ id: "wind", title: "Strong Winds", severity: "moderate", detail: `Gusts near ${maxWind.toFixed(0)} km/h.` });
  if (storm) a.push({ id: "thunder", title: "Thunderstorms", severity: "moderate", detail: "Lightning activity likely — stay indoors during storms." });
  if (week < 2 && maxTemp > 32) a.push({ id: "drought", title: "Drought Conditions", severity: "moderate", detail: "Almost no rainfall expected this week with high temperatures." });
  if (maxTemp >= 40) a.push({ id: "heatwave", title: "Heatwave", severity: "high", detail: `Temperatures up to ${maxTemp.toFixed(0)}°C.` });
  if (minTemp <= 4) a.push({ id: "coldwave", title: "Cold Wave", severity: "moderate", detail: `Lows near ${minTemp.toFixed(0)}°C — frost possible.` });
  return a;
}

export function pestRisk(temp: number, humidity: number) {
  if (humidity >= 80 && temp >= 22 && temp <= 32) return "high";
  if (humidity >= 65 && temp >= 18) return "moderate";
  return "low";
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function searchPlaces(q: string): Promise<GeoPlace[]> {
  if (!q.trim()) return [];
  const data = await json<{ results?: Array<Record<string, unknown>> }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`,
  );
  return (data.results ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    admin: (r.admin1 as string) ?? undefined,
    country: (r.country as string) ?? undefined,
    lat: Number(r.latitude),
    lon: Number(r.longitude),
  }));
}

export async function reverseName(lat: number, lon: number): Promise<string> {
  try {
    const data = await json<{ city?: string; locality?: string; principalSubdivision?: string }>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    const name = data.city || data.locality;
    return name ? `${name}${data.principalSubdivision ? ", " + data.principalSubdivision : ""}` : `${lat.toFixed(2)}\u00b0, ${lon.toFixed(2)}\u00b0`;
  } catch {
    return `${lat.toFixed(2)}\u00b0, ${lon.toFixed(2)}\u00b0`;
  }
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export async function fetchClimate(place: GeoPlace): Promise<ClimateSnapshot> {
  const { lat, lon } = place;
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,is_day` +
    `&hourly=temperature_2m,precipitation,precipitation_probability,visibility,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max` +
    `&timezone=auto&forecast_days=7`;
  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10&timezone=auto`;

  const end = new Date();
  const start = new Date(end.getTime() - 365 * 24 * 3600 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const archiveUrl =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
    `&start_date=${iso(start)}&end_date=${iso(new Date(end.getTime() - 6 * 24 * 3600 * 1000))}` +
    `&daily=precipitation_sum&timezone=auto`;

  const [f, air, archive] = await Promise.all([
    json<any>(forecastUrl),
    json<any>(airUrl).catch(() => null),
    json<any>(archiveUrl).catch(() => null),
  ]);

  const nowIdx = Math.max(
    0,
    (f.hourly.time as string[]).findIndex((t: string) => new Date(t).getTime() >= Date.now()),
  );

  const monthly: MonthlyRain[] = [];
  if (archive?.daily?.time) {
    const acc = new Map<string, number>();
    (archive.daily.time as string[]).forEach((t, i) => {
      const k = monthKey(t);
      acc.set(k, (acc.get(k) ?? 0) + (archive.daily.precipitation_sum[i] ?? 0));
    });
    for (const [month, rain] of acc) monthly.push({ month, rain: Math.round(rain) });
  }

  return {
    place,
    current: {
      temperature: f.current.temperature_2m,
      apparent: f.current.apparent_temperature,
      humidity: f.current.relative_humidity_2m,
      pressure: f.current.surface_pressure,
      windSpeed: f.current.wind_speed_10m,
      windDir: f.current.wind_direction_10m,
      cloud: f.current.cloud_cover,
      precipitation: f.current.precipitation,
      weatherCode: f.current.weather_code,
      isDay: f.current.is_day,
      uv: f.hourly.uv_index?.[nowIdx] ?? f.daily.uv_index_max?.[0] ?? 0,
      visibility: (f.hourly.visibility?.[nowIdx] ?? 0) / 1000,
    },
    hourly: {
      time: (f.hourly.time as string[]).slice(nowIdx, nowIdx + 24),
      precipitation: f.hourly.precipitation.slice(nowIdx, nowIdx + 24),
      precipitation_probability: (f.hourly.precipitation_probability ?? []).slice(nowIdx, nowIdx + 24),
      temperature_2m: f.hourly.temperature_2m.slice(nowIdx, nowIdx + 24),
    },
    daily: f.daily,
    air: {
      aqi: air?.current?.european_aqi ?? null,
      pm2_5: air?.current?.pm2_5 ?? null,
      pm10: air?.current?.pm10 ?? null,
    },
    monthly,
    fetchedAt: Date.now(),
  };
}

export function readCache(): ClimateSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ClimateSnapshot) : null;
  } catch {
    return null;
  }
}

export function writeCache(s: ClimateSnapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* quota — ignore */
  }
}

export function readPlaces(): GeoPlace[] {
  try {
    const raw = localStorage.getItem(PLACES_KEY);
    return raw ? (JSON.parse(raw) as GeoPlace[]) : [];
  } catch {
    return [];
  }
}

export function writePlaces(p: GeoPlace[]) {
  try {
    localStorage.setItem(PLACES_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
