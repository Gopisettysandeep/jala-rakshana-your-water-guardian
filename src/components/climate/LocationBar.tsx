import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Star, X, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { searchPlaces, type GeoPlace } from "@/lib/climate";

export function LocationBar({
  place,
  places,
  onPick,
  onDetect,
  onSave,
  onRemove,
}: {
  place: GeoPlace | null;
  places: GeoPlace[];
  onPick: (p: GeoPlace) => void;
  onDetect: () => void;
  onSave: () => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchPlaces(q));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  const saved = place ? places.some((p) => p.id === place.id) : false;

  return (
    <section className="glass rounded-3xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-secondary/60 px-3 py-2">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_place")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
          />
          {searching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {q && (
            <button onClick={() => setQ("")} aria-label={t("remove")}>
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={onDetect}
          aria-label={t("use_my_location")}
          className="grid place-items-center size-10 shrink-0 rounded-2xl bg-hero text-primary-foreground shadow-glow"
        >
          <MapPin className="size-4" />
        </button>
        <button
          onClick={onSave}
          aria-label={t("save_place")}
          className={`grid place-items-center size-10 shrink-0 rounded-2xl ${
            saved ? "bg-eco text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          <Star className="size-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {results.length > 0 && (
        <ul className="rounded-2xl bg-secondary/60 divide-y divide-border/50 overflow-hidden">
          {results.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => {
                  onPick(r);
                  setQ("");
                  setResults([]);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary"
              >
                {r.name}
                <span className="text-muted-foreground text-xs">
                  {r.admin ? `, ${r.admin}` : ""}{r.country ? ` · ${r.country}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {places.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground mb-1">{t("saved_places")}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {places.map((p) => (
              <span
                key={p.id}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs shrink-0 ${
                  place?.id === p.id ? "bg-hero text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <button onClick={() => onPick(p)}>{p.name}</button>
                <button onClick={() => onRemove(p.id)} aria-label={t("remove")}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
