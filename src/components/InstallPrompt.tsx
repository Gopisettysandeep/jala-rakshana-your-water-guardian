import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function InstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Register the offline service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div className="fixed bottom-24 inset-x-3 z-40 glass rounded-2xl p-3 flex items-center gap-3 shadow-glow">
      <Download className="size-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{t("install_app")}</p>
        <p className="text-[11px] text-muted-foreground truncate">{t("offline_ready")}</p>
      </div>
      <button
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
        className="rounded-xl bg-hero text-primary-foreground px-3 py-1.5 text-xs font-medium"
      >
        {t("install_app")}
      </button>
      <button onClick={() => setHidden(true)} aria-label="Dismiss" className="text-muted-foreground">
        <X className="size-4" />
      </button>
    </div>
  );
}
