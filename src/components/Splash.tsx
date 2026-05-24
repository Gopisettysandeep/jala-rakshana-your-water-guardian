import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1600);
    const t2 = setTimeout(onDone, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-hero text-primary-foreground transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative grid place-items-center">
        <span className="absolute size-28 rounded-full bg-primary-foreground/20 animate-ripple" />
        <span className="absolute size-28 rounded-full bg-primary-foreground/10 animate-ripple [animation-delay:600ms]" />
        <div className="relative grid place-items-center size-20 rounded-full bg-primary-foreground/95 text-primary shadow-glow animate-drop">
          <Droplet className="size-10" strokeWidth={2.4} />
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-bold tracking-tight animate-drop [animation-delay:200ms]">
        {t("app_name")}
      </h1>
      <p className="mt-2 text-sm opacity-90 animate-drop [animation-delay:400ms] text-balance text-center px-8">
        {t("tagline")}
      </p>
      <p className="absolute bottom-10 text-xs opacity-70">{t("splash_loading")}</p>
    </div>
  );
}
