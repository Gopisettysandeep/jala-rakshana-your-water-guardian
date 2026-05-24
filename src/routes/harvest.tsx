import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Home, Waves, Database, Mountain, Recycle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/harvest")({
  head: () => ({
    meta: [
      { title: "Rainwater Harvesting — Jala Rakshana" },
      { name: "description", content: "Rooftop systems, recharge pits, storage tanks, pond restoration, and step-by-step harvesting guides." },
    ],
  }),
  component: HarvestPage,
});

const SECTIONS = [
  {
    icon: Home,
    title: "Rooftop rainwater harvesting",
    body: "Channel rain from your roof through gutters, a first-flush diverter, and a filter into a storage tank or recharge pit. A 100 m² roof in a 700 mm rainfall area can collect ~50,000 litres a year.",
    steps: ["Clean the rooftop & gutters", "Install a first-flush diverter", "Add a sand-gravel filter", "Route into tank or recharge pit"],
  },
  {
    icon: Database,
    title: "Recharge pits",
    body: "A 1×1×2 m pit filled with boulders, gravel, and sand near the downspout lets rainwater seep into the soil and recharge the local aquifer. Ideal for individual houses.",
  },
  {
    icon: Waves,
    title: "Storage tanks",
    body: "Above-ground or underground tanks (RCC, ferrocement, or HDPE) store filtered rainwater for non-potable uses like flushing, gardening, and washing — cutting municipal demand by 30–50%.",
  },
  {
    icon: Mountain,
    title: "Village pond restoration",
    body: "Desilt traditional tanks, strengthen bunds, plant native trees on the catchment, and prevent encroachment. Restored ponds raise water tables for kilometres around.",
  },
  {
    icon: Recycle,
    title: "Groundwater recharge systems",
    body: "Recharge wells, check dams, percolation tanks, and contour trenches slow runoff and push water underground. They reduce floods downstream and refill borewells upstream.",
  },
];

const BENEFITS = [
  "Reduces dependence on municipal & tanker water",
  "Recharges groundwater & raises borewell levels",
  "Lowers monthly water bills",
  "Reduces urban flooding & soil erosion",
  "Provides soft, chemical-free water for plants",
];

function HarvestPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("harvest_title")} subtitle={t("harvest_sub")} icon={CloudRain} variant="eco" />
      <main className="px-4 py-5 space-y-3">
        {SECTIONS.map((s) => (
          <article key={s.title} className="glass rounded-3xl p-4">
            <header className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-2xl bg-hero text-primary-foreground shadow-soft">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
            </header>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{s.body}</p>
            {s.steps && (
              <ol className="mt-3 space-y-2">
                {s.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-foreground/80">
                    <span className="grid place-items-center size-6 rounded-full bg-eco text-primary-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}

        <article className="glass rounded-3xl p-4">
          <h3 className="font-semibold">{t("benefits")}</h3>
          <ul className="mt-3 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-2 text-sm text-foreground/80">
                <span className="mt-1 size-1.5 rounded-full bg-accent shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </article>
      </main>
    </div>
  );
}
