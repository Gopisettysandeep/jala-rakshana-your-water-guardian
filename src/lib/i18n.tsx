import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, RTL_LANGS, TRANSLATIONS, type LangCode } from "./translations";

type FontSize = "small" | "medium" | "large";
type Theme = "light" | "dark";

interface Settings {
  lang: LangCode;
  theme: Theme;
  fontSize: FontSize;
  micEnabled: boolean;
  speakReplies: boolean;
  notifications: boolean;
}

interface Ctx extends Settings {
  t: (key: string) => string;
  setLang: (l: LangCode) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  setMicEnabled: (v: boolean) => void;
  setSpeakReplies: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
}

const STORAGE_KEY = "jala-rakshana-settings";
const DEFAULT: Settings = {
  lang: "en",
  theme: "light",
  fontSize: "medium",
  micEnabled: true,
  speakReplies: false,
  notifications: true,
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.lang = settings.lang;
    root.dir = RTL_LANGS.includes(settings.lang) ? "rtl" : "ltr";
    root.style.fontSize =
      settings.fontSize === "small" ? "14px" : settings.fontSize === "large" ? "18px" : "16px";
  }, [settings, hydrated]);

  const value = useMemo<Ctx>(() => {
    const dict = TRANSLATIONS[settings.lang] ?? TRANSLATIONS.en;
    const fallback = TRANSLATIONS.en;
    return {
      ...settings,
      t: (k) => dict[k] ?? fallback[k] ?? k,
      setLang: (lang) => setSettings((s) => ({ ...s, lang })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
      setMicEnabled: (micEnabled) => setSettings((s) => ({ ...s, micEnabled })),
      setSpeakReplies: (speakReplies) => setSettings((s) => ({ ...s, speakReplies })),
      setNotifications: (notifications) => setSettings((s) => ({ ...s, notifications })),
    };
  }, [settings]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export { LANGUAGES };
export type { LangCode };
