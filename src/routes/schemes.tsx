import { createFileRoute } from "@tanstack/react-router";
import { Landmark, ExternalLink, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Water Schemes — Jala Rakshana" },
      { name: "description", content: "Jal Jeevan Mission, Atal Bhujal, PMKSY, National Water Mission, Mission Kakatiya and more." },
    ],
  }),
  component: SchemesPage,
});

interface Scheme {
  name: string;
  short: string;
  objectives: string;
  benefits: string;
  eligibility: string;
  apply: string;
  url: string;
}

const SCHEMES: Scheme[] = [
  {
    name: "Jal Jeevan Mission (JJM)",
    short: "Functional tap water connection to every rural household.",
    objectives: "Provide safe, adequate drinking water through individual household tap connections (Har Ghar Jal) by 2024.",
    benefits: "55 litres per person per day; reduced drudgery for women; improved health.",
    eligibility: "All rural households across India.",
    apply: "Apply through your Gram Panchayat / Village Water & Sanitation Committee.",
    url: "https://jaljeevanmission.gov.in",
  },
  {
    name: "Atal Bhujal Yojana",
    short: "Community-led sustainable groundwater management.",
    objectives: "Improve groundwater management in water-stressed blocks of 7 states through community participation.",
    benefits: "Water budgeting, recharge structures, capacity building.",
    eligibility: "Identified blocks in Gujarat, Haryana, Karnataka, MP, Maharashtra, Rajasthan, UP.",
    apply: "Coordinated through State Groundwater Departments.",
    url: "https://ataljal.mowr.gov.in",
  },
  {
    name: "PMKSY",
    short: "Pradhan Mantri Krishi Sinchayee Yojana — 'Per Drop More Crop'.",
    objectives: "Expand irrigation coverage and improve on-farm water-use efficiency.",
    benefits: "Subsidy on drip & sprinkler systems; micro-irrigation; watershed development.",
    eligibility: "Farmers across India; priority for small & marginal farmers.",
    apply: "Apply via your State Agriculture/Horticulture Department or PMKSY portal.",
    url: "https://pmksy.gov.in",
  },
  {
    name: "National Water Mission",
    short: "One of 8 missions under National Action Plan on Climate Change.",
    objectives: "Conserve water, minimise wastage, ensure equitable distribution.",
    benefits: "Awareness campaigns (Catch The Rain), data systems, water-use efficiency targets.",
    eligibility: "Applies through state-level implementation.",
    apply: "Engagement via state water departments and citizen campaigns.",
    url: "https://nwm.gov.in",
  },
  {
    name: "Swachh Bharat Mission",
    short: "Sanitation, ODF status, and greywater management.",
    objectives: "Eliminate open defecation, manage solid & liquid waste, protect water sources.",
    benefits: "Toilet construction support, ODF villages, cleaner water bodies.",
    eligibility: "All households; rural & urban components.",
    apply: "Through Gram Panchayat or Urban Local Body.",
    url: "https://swachhbharatmission.ddws.gov.in",
  },
  {
    name: "Mission Kakatiya (Telangana)",
    short: "Restoration of minor irrigation tanks.",
    objectives: "Desilt and restore ~46,000 tanks to revive irrigation and groundwater.",
    benefits: "Increased ayacut, higher groundwater, free silt for farmers.",
    eligibility: "Telangana state — community-managed tanks.",
    apply: "Through Irrigation Department, Government of Telangana.",
    url: "https://irrigation.telangana.gov.in",
  },
  {
    name: "MGNREGA Water Conservation",
    short: "Wage-employment guarantee with focus on water works.",
    objectives: "Build farm ponds, check dams, recharge pits, soak pits, and watershed structures.",
    benefits: "Livelihood + durable water assets in villages.",
    eligibility: "Adult members of rural households with job cards.",
    apply: "Apply for a job card at Gram Panchayat; demand work in writing.",
    url: "https://nrega.nic.in",
  },
];

function SchemesPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>(SCHEMES[0].name);
  return (
    <div>
      <PageHeader title={t("schemes_title")} subtitle={t("schemes_sub")} icon={Landmark} />
      <main className="px-4 py-5 space-y-3">
        {SCHEMES.map((s) => {
          const isOpen = open === s.name;
          return (
            <article key={s.name} className="glass rounded-3xl overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : s.name)}
                className="w-full text-left p-4 flex items-start gap-3"
                aria-expanded={isOpen}
              >
                <div className="grid place-items-center size-10 rounded-2xl bg-hero text-primary-foreground shadow-soft shrink-0">
                  <Landmark className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight">{s.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.short}</p>
                </div>
                <ChevronDown className={`size-5 mt-1 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 text-sm">
                  <Detail label={t("objectives")} value={s.objectives} />
                  <Detail label={t("benefits")} value={s.benefits} />
                  <Detail label={t("eligibility")} value={s.eligibility} />
                  <Detail label={t("how_to_apply")} value={s.apply} />
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:underline"
                  >
                    {t("visit_official")} <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="mt-0.5 text-foreground/85 leading-relaxed">{value}</p>
    </div>
  );
}
