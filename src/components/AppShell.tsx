import { useState, type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { GamificationProvider } from "@/lib/gamification";
import { BottomNav } from "./BottomNav";
import { Splash } from "./Splash";
import { InstallPrompt } from "./InstallPrompt";

function Frame({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative">
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      {children}
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}

export function AppShell() {
  return (
    <I18nProvider>
      <GamificationProvider>
        <Frame>
          <Outlet />
        </Frame>
      </GamificationProvider>
    </I18nProvider>
  );
}
