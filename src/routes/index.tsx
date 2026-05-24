import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, CloudRain, Landmark, MessageCircle, Sparkles, Leaf, Sun, Bell } from "lucide-react";
import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jala Rakshana — Home" },
      { name: "description", content: "Daily water tips, conservation modules, AI assistant — all in your language." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const tipKey = useMemo(() => {
    const day = new Date().getDate();
    return `tip_${(day % 5) + 1}`;
  }, []);

  const cards = [
    { to: "/conservation", icon: Droplets, title: t("conservation_title"), sub: t("conservation_sub"), tint: "bg-hero" },
    { to: "/harvest", icon: CloudRain, title: t("harvest_title"), sub: t("harvest_sub"), tint: "bg-eco" },
    { to: "/schemes", icon: Landmark, title: t("schemes_title"), sub: t("schemes_sub"), tint: "bg-hero" },
    { to: "/assistant", icon: MessageCircle, title: t("assistant_title"), sub: t("assistant_sub"), tint: "bg-eco" },
  ];

  return (
    <div className="relative">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-hero text-primary-foreground rounded-b-[2.5rem] px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8 shadow-glow">
        <div className="absolute -top-10 -right-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-6 size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">{t("app_name")}</p>
            <h1 className="mt-1 text-2xl font-bold text-balance">{t("dashboard_greeting")}</h1>
            <p className="mt-1 text-sm opacity-90 text-balance">{t("tagline")}</p>
          </div>
          <div className="grid place-items-center size-12 rounded-2xl bg-white/15 backdrop-blur-sm animate-float">
            <Droplets className="size-6" />
          </div>
        </div>

        <div className="relative mt-6 glass !bg-white/15 !border-white/25 text-primary-foreground rounded-2xl p-4 flex gap-3 items-start">
          <Sparkles className="size-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">{t("daily_tip")}</p>
            <p className="mt-1 text-sm leading-relaxed">{t(tipKey)}</p>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
            {t("explore")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.map(({ to, icon: Icon, title, sub, tint }) => (
              <Link
                key={to}
                to={to}
                className="group relative overflow-hidden rounded-3xl glass p-4 active:scale-[0.98] transition-transform"
              >
                <div className={`absolute -top-6 -right-6 size-20 rounded-full ${tint} opacity-25 blur-xl`} />
                <div className={`grid place-items-center size-10 rounded-2xl ${tint} text-primary-foreground shadow-soft`}>
                  <Icon className="size-5" />
                </div>
                <p className="mt-3 font-semibold text-sm leading-tight">{title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{sub}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Leaf className="size-4 text-[color:var(--leaf)]" />
            <span>Quote of the day</span>
          </div>
          <p className="mt-2 text-sm italic text-foreground/80 leading-relaxed">"{t("quote")}"</p>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            { icon: Droplets, label: "150L", sub: "avg/person/day" },
            { icon: Sun, label: "3.5°C", sub: "summer rise" },
            { icon: Bell, label: "21%", sub: "India stressed" },
          ].map((s) => (
            <div key={s.sub} className="glass rounded-2xl p-3 text-center">
              <s.icon className="size-4 mx-auto text-primary" />
              <p className="mt-1 font-bold text-sm">{s.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.sub}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
