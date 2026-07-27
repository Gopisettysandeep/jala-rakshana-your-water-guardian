import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Droplet, Wind, Gauge, Sun, Eye, Cloud, Sunrise, Sunset, Thermometer,
  AlertTriangle, Sprout, CalendarDays, Scissors, ShieldCheck, Bug, Loader2, Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  aqiLabelKey, collectionPotential, compass, describeCode, pestRisk, rainIntensity,
  type ClimateSnapshot, type RiskAlert,
} from "@/lib/climate";
import type { ClimateAdvice } from "@/lib/climate.functions";

export function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3 text-center">
      <Icon className="size-4 mx-auto text-primary" />
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-5">
      {title && <h3 className="text-sm font-semibold mb-3">{title}</h3>}
      {children}
    </section>
  );
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export function NowPanel({ s, alerts }: { s: ClimateSnapshot; alerts: RiskAlert[] }) {
  const { t } = useI18n();
  const c = s.current;
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs text-muted-foreground">{describeCode(c.weatherCode)}</p>
        <div className="mt-1 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{Math.round(c.temperature)}°</span>
            <span className="text-sm text-muted-foreground">C</span>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{t("feels_like")} {Math.round(c.apparent)}°</p>
            <p>
              {Math.round(s.daily.temperature_2m_min[0])}° / {Math.round(s.daily.temperature_2m_max[0])}°
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric icon={Droplet} label={t("humidity")} value={`${Math.round(c.humidity)}%`} />
          <Metric icon={Wind} label={t("wind_speed")} value={`${Math.round(c.windSpeed)} km/h ${compass(c.windDir)}`} />
          <Metric icon={Gauge} label={t("pressure")} value={`${Math.round(c.pressure)} hPa`} />
          <Metric icon={Sun} label={t("uv_index")} value={`${c.uv.toFixed(1)}`} />
          <Metric icon={Eye} label={t("visibility")} value={`${c.visibility.toFixed(1)} km`} />
          <Metric icon={Cloud} label={t("cloud_cover")} value={`${Math.round(c.cloud)}%`} />
          <Metric icon={Thermometer} label={t("rain_now")} value={`${c.precipitation} ${t("mm")}`} />
          <Metric icon={Sunrise} label={t("sunrise")} value={hhmm(s.daily.sunrise[0])} />
          <Metric icon={Sunset} label={t("sunset")} value={hhmm(s.daily.sunset[0])} />
        </div>
      </Card>

      <Card title={t("air_quality")}>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{s.air.aqi ?? "—"}</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{t(aqiLabelKey(s.air.aqi))}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          PM2.5 {s.air.pm2_5 ?? "—"} µg/m³ · PM10 {s.air.pm10 ?? "—"} µg/m³
        </p>
      </Card>

      <AlertsCard alerts={alerts} />
    </div>
  );
}

export function AlertsCard({ alerts }: { alerts: RiskAlert[] }) {
  const { t } = useI18n();
  const tone = (sev: RiskAlert["severity"]) =>
    sev === "high"
      ? "bg-destructive/15 text-destructive"
      : sev === "moderate"
      ? "bg-primary/15 text-primary"
      : "bg-secondary text-secondary-foreground";
  return (
    <Card title={t("risk_alerts")}>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("no_alerts")}</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className={`rounded-2xl p-3 ${tone(a.severity)}`}>
              <p className="text-sm font-semibold inline-flex items-center gap-1.5">
                <AlertTriangle className="size-4" /> {a.title}
                <span className="text-[10px] font-normal opacity-80">
                  · {t(`severity_${a.severity}`)}
                </span>
              </p>
              <p className="text-xs mt-1 opacity-90">{a.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function RainPanel({
  s,
  roofArea,
  setRoofArea,
}: {
  s: ClimateSnapshot;
  roofArea: number;
  setRoofArea: (n: number) => void;
}) {
  const { t } = useI18n();
  const hourly = useMemo(
    () =>
      s.hourly.time.map((time, i) => ({
        label: hhmm(time),
        mm: s.hourly.precipitation[i] ?? 0,
        prob: s.hourly.precipitation_probability[i] ?? 0,
      })),
    [s],
  );
  const daily = useMemo(
    () =>
      s.daily.time.map((d, i) => ({
        label: i === 0 ? "Today" : new Date(d).toLocaleDateString(undefined, { weekday: "short" }),
        mm: s.daily.precipitation_sum[i] ?? 0,
        prob: s.daily.precipitation_probability_max?.[i] ?? 0,
        code: s.daily.weather_code[i],
        min: s.daily.temperature_2m_min[i],
        max: s.daily.temperature_2m_max[i],
      })),
    [s],
  );
  const weekRain = daily.reduce((a, b) => a + b.mm, 0);
  const intensity = rainIntensity(s.current.precipitation);

  return (
    <div className="space-y-4">
      <Card title={t("rain_status")}>
        <p className="text-2xl font-bold">
          {s.current.precipitation > 0 ? t("raining") : t("not_raining")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("rain_intensity")}: {intensity} · {s.current.precipitation} {t("mm")}/h
        </p>
      </Card>

      <Card title={t("hourly_forecast")}>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={hourly}>
            <defs>
              <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
            <YAxis tick={{ fontSize: 10 }} width={28} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="mm" stroke="hsl(var(--primary))" fill="url(#rainFill)" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t("rain_probability")}: {Math.max(...hourly.map((h) => h.prob), 0)}%
        </p>
      </Card>

      <Card title={t("daily_forecast")}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={28} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="mm" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-1.5">
          {daily.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <span className="w-14 text-muted-foreground">{d.label}</span>
              <span className="flex-1 truncate px-2">{describeCode(d.code)}</span>
              <span className="w-16 text-right text-muted-foreground">{d.mm} {t("mm")} · {d.prob}%</span>
              <span className="w-16 text-right font-medium">
                {Math.round(d.min)}°/{Math.round(d.max)}°
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t("collection_potential")}>
        <label className="text-xs text-muted-foreground">{t("roof_area")}</label>
        <input
          type="number"
          min={1}
          value={roofArea}
          onChange={(e) => setRoofArea(Math.max(1, Number(e.target.value) || 1))}
          className="mt-1 w-full rounded-2xl bg-secondary/60 px-3 py-2 text-sm outline-none"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric
            icon={Droplet}
            label={`${t("daily_forecast")} (7d)`}
            value={`${collectionPotential(weekRain, roofArea).toLocaleString()} ${t("litres")}`}
          />
          <Metric
            icon={Droplet}
            label={t("annual_rainfall")}
            value={`${collectionPotential(
              s.monthly.reduce((a, b) => a + b.rain, 0) || weekRain * 52,
              roofArea,
            ).toLocaleString()} ${t("litres")}`}
          />
        </div>
      </Card>
    </div>
  );
}

export function AdvisorPanel({
  advice,
  loading,
  onGenerate,
  alerts,
}: {
  advice: ClimateAdvice | null;
  loading: boolean;
  onGenerate: () => void;
  alerts: RiskAlert[];
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-hero text-primary-foreground py-2.5 text-sm font-medium shadow-glow disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {loading ? t("ai_thinking") : t("generate_advice")}
      </button>

      {advice && (
        <>
          <Card>
            <p className="text-sm leading-relaxed">{advice.summary}</p>
          </Card>
          <Card title={t("harvest_advisor")}>
            <Bullets items={advice.harvesting} />
          </Card>
          <Card title={t("conservation_tips_smart")}>
            <Bullets items={advice.conservation} />
          </Card>
          {advice.precautions?.length > 0 && (
            <Card title={t("precautions")}>
              <Bullets items={advice.precautions} />
            </Card>
          )}
        </>
      )}

      <AlertsCard alerts={alerts} />
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {(items ?? []).map((x, i) => (
        <li key={i} className="text-sm flex gap-2 leading-relaxed">
          <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

export function FarmPanel({
  s,
  advice,
  loading,
  onGenerate,
}: {
  s: ClimateSnapshot;
  advice: ClimateAdvice | null;
  loading: boolean;
  onGenerate: () => void;
}) {
  const { t } = useI18n();
  const risk = pestRisk(s.current.temperature, s.current.humidity);
  const a = advice?.agriculture;
  return (
    <div className="space-y-4">
      <Card title={t("agri_advisory")}>
        <div className="grid grid-cols-2 gap-2">
          <Metric icon={Droplet} label={t("humidity")} value={`${Math.round(s.current.humidity)}%`} />
          <Metric icon={Bug} label={t("pest_risk")} value={t(`severity_${risk}`)} />
        </div>
        {!advice && (
          <button
            onClick={onGenerate}
            disabled={loading}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-hero text-primary-foreground py-2.5 text-sm font-medium shadow-glow disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? t("ai_thinking") : t("generate_advice")}
          </button>
        )}
      </Card>

      {a && (
        <>
          <Card title={t("suitable_crops")}>
            <div className="flex flex-wrap gap-2">
              {a.crops?.map((c) => (
                <span key={c} className="rounded-full bg-secondary px-3 py-1 text-xs inline-flex items-center gap-1">
                  <Sprout className="size-3 text-primary" /> {c}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <Row icon={CalendarDays} label={t("sowing_period")} value={a.sowing} />
            <Row icon={Scissors} label={t("harvest_period")} value={a.harvesting} />
            <Row icon={Droplet} label={t("irrigation")} value={a.irrigation} />
            <Row icon={ShieldCheck} label={t("crop_protection")} value={a.protection} />
          </Card>
        </>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-border/40 last:border-0">
      <Icon className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export function MapsPanel({ s, layer, setLayer }: { s: ClimateSnapshot; layer: string; setLayer: (l: string) => void }) {
  const { t } = useI18n();
  const layers: Array<{ id: string; label: string }> = [
    { id: "rain", label: t("map_rain") },
    { id: "temp", label: t("map_temp") },
    { id: "wind", label: t("map_wind") },
    { id: "clouds", label: t("map_clouds") },
  ];
  const src = `https://embed.windy.com/embed2.html?lat=${s.place.lat}&lon=${s.place.lon}&zoom=6&level=surface&overlay=${layer}&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setLayer(l.id)}
            className={`rounded-full px-3 py-1.5 text-xs shrink-0 ${
              layer === l.id ? "bg-hero text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="glass rounded-3xl overflow-hidden">
        <iframe
          key={layer}
          title="Interactive climate map"
          src={src}
          className="w-full h-[420px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function TrendsPanel({ s }: { s: ClimateSnapshot }) {
  const { t } = useI18n();
  const monthly = s.monthly.map((m) => ({
    label: new Date(`${m.month}-01`).toLocaleDateString(undefined, { month: "short" }),
    rain: m.rain,
  }));
  const temps = s.daily.time.map((d, i) => ({
    label: new Date(d).toLocaleDateString(undefined, { weekday: "short" }),
    max: s.daily.temperature_2m_max[i],
    min: s.daily.temperature_2m_min[i],
  }));
  const annual = s.monthly.reduce((a, b) => a + b.rain, 0);

  return (
    <div className="space-y-4">
      <Card title={t("monthly_trend")}>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="rain" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {t("annual_rainfall")}: {annual} {t("mm")}
        </p>
      </Card>

      <Card title={t("temp_history")}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={temps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={28} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Line type="monotone" dataKey="max" stroke="hsl(var(--destructive))" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="min" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
