import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Globe, Mic, Volume2, Bell, Type, Moon, Sun, Info } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Jala Rakshana" },
      { name: "description", content: "Change language, theme, font size, microphone and voice preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useI18n();
  return (
    <div>
      <PageHeader title={s.t("settings")} icon={SettingsIcon} />
      <main className="px-4 py-5 space-y-4">
        <section className="glass rounded-3xl p-4">
          <Header icon={Globe} label={s.t("language")} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => s.setLang(l.code)}
                className={`rounded-2xl p-2 text-center transition active:scale-95 ${
                  s.lang === l.code
                    ? "bg-hero text-primary-foreground shadow-glow"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm font-semibold leading-tight">{l.native}</p>
                <p className="text-[10px] opacity-70">{l.label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 space-y-3">
          <Header icon={s.theme === "dark" ? Moon : Sun} label={s.t("theme")} />
          <div className="grid grid-cols-2 gap-2">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => s.setTheme(m)}
                className={`rounded-2xl py-2 text-sm font-medium transition ${
                  s.theme === m ? "bg-hero text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {s.t(m)}
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 space-y-3">
          <Header icon={Type} label={s.t("font_size")} />
          <div className="grid grid-cols-3 gap-2">
            {(["small", "medium", "large"] as const).map((m) => (
              <button
                key={m}
                onClick={() => s.setFontSize(m)}
                className={`rounded-2xl py-2 text-sm font-medium transition ${
                  s.fontSize === m ? "bg-hero text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {s.t(m)}
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 space-y-3">
          <Header icon={Mic} label={s.t("voice_settings")} />
          <Toggle label={s.t("enable_mic")} checked={s.micEnabled} onChange={s.setMicEnabled} icon={Mic} />
          <Toggle label={s.t("speak_replies")} checked={s.speakReplies} onChange={s.setSpeakReplies} icon={Volume2} />
        </section>

        <section className="glass rounded-3xl p-4">
          <Header icon={Bell} label={s.t("notifications")} />
          <div className="mt-3">
            <Toggle label={s.t("notifications")} checked={s.notifications} onChange={s.setNotifications} icon={Bell} />
          </div>
        </section>

        <section className="glass rounded-3xl p-4 text-sm text-muted-foreground">
          <Header icon={Info} label={s.t("about")} />
          <p className="mt-3 leading-relaxed">
            {s.t("app_name")} — {s.t("tagline")}.
          </p>
          <p className="mt-2 text-xs">v1.0 · Powered by Lovable AI</p>
        </section>
      </main>
    </div>
  );
}

function Header({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <Icon className="size-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: any;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 py-1.5"
      role="switch"
      aria-checked={checked}
    >
      <span className="flex items-center gap-2 text-sm">
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-hero" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
