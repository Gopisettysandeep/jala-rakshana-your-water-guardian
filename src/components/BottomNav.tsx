import { Link, useLocation } from "@tanstack/react-router";
import { Home, Droplets, CloudRain, Landmark, MessageCircle, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BottomNav() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const items = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/conservation", icon: Droplets, label: t("conserve") },
    { to: "/harvest", icon: CloudRain, label: t("harvest") },
    { to: "/schemes", icon: Landmark, label: t("schemes") },
    { to: "/assistant", icon: MessageCircle, label: t("assistant") },
    { to: "/settings", icon: Settings, label: t("settings") },
  ];
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 glass rounded-t-3xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <ul className="flex items-center justify-between gap-1">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] transition-all ${
                  active
                    ? "text-primary-foreground bg-hero shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                <span className="truncate max-w-full px-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
