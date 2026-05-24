import { createFileRoute } from "@tanstack/react-router";
import { Droplets, AlertTriangle, Home as HomeIcon, Sprout, Building2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/conservation")({
  head: () => ({
    meta: [
      { title: "Water Conservation — Jala Rakshana" },
      { name: "description", content: "Why water matters, causes of scarcity, and proven ways to save water at home, in farms, and villages." },
    ],
  }),
  component: ConservationPage,
});

const SECTIONS = [
  {
    icon: Droplets,
    title: "Why water matters",
    body: "Only 0.5% of Earth's water is accessible freshwater. It powers drinking, sanitation, food production, industry, and ecosystems. Conserving it is the cheapest, fastest climate action available to every household.",
  },
  {
    icon: AlertTriangle,
    title: "Causes of water scarcity",
    body: "Over-extraction of groundwater, polluted rivers, deforestation, unplanned urban growth, climate-driven monsoon shifts, and wasteful agriculture all push India toward water stress. 21 major cities have already faced 'Day Zero' warnings.",
  },
  {
    icon: AlertTriangle,
    title: "Effects of water wastage",
    body: "A single leaking tap wastes up to 5,500 litres a year. Wastage lowers groundwater tables, hurts crop yields, and forces governments to spend on tankers instead of schools and hospitals.",
  },
  {
    icon: HomeIcon,
    title: "Save water at home",
    items: [
      "Close the tap while brushing or shaving.",
      "Use a bucket instead of a hose to wash vehicles.",
      "Run washing machines on full loads only.",
      "Install dual-flush toilets and aerators on taps.",
      "Reuse RO reject water for floors and plants.",
    ],
  },
  {
    icon: Sprout,
    title: "Agricultural water saving",
    items: [
      "Drip and sprinkler irrigation — 30–60% less water.",
      "Mulching to lock soil moisture.",
      "Crop rotation with millets and pulses in dry zones.",
      "Direct-seeded rice instead of transplanted paddy.",
      "Soil moisture sensors to irrigate only when needed.",
    ],
  },
  {
    icon: Building2,
    title: "Smart village water management",
    body: "Map every water source, rebuild traditional tanks, decentralise treatment, and form Village Water & Sanitation Committees. Combine rain-fed structures with metered piped supply to balance demand.",
  },
  {
    icon: ShieldCheck,
    title: "Groundwater protection",
    body: "Stop unregulated borewells, recharge aquifers with rainwater pits, treat wastewater before disposal, and protect catchment areas from encroachment. Healthy groundwater is our drought insurance.",
  },
];

function ConservationPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("conservation_title")} subtitle={t("conservation_sub")} icon={Droplets} />
      <main className="px-4 py-5 space-y-3">
        {SECTIONS.map((s) => (
          <article key={s.title} className="glass rounded-3xl p-4">
            <header className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-2xl bg-eco text-primary-foreground shadow-soft">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
            </header>
            {s.body && <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{s.body}</p>}
            {s.items && (
              <ul className="mt-3 space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/80">
                    <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </main>
    </div>
  );
}
