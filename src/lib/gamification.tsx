import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type BadgeId = "first_drop" | "quiz_novice" | "quiz_master" | "pledger" | "eco_hero";

export interface BadgeDef {
  id: BadgeId;
  name: string;
  desc: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_drop", name: "First Drop", desc: "Earn your first eco-point", emoji: "💧" },
  { id: "quiz_novice", name: "Quiz Novice", desc: "Complete your first quiz", emoji: "🎓" },
  { id: "quiz_master", name: "Quiz Master", desc: "Score 100% on a quiz", emoji: "🏆" },
  { id: "pledger", name: "Pledger", desc: "Make your first pledge", emoji: "🤝" },
  { id: "eco_hero", name: "Eco Hero", desc: "Reach 100 eco-points", emoji: "🌍" },
];

interface State {
  points: number;
  badges: BadgeId[];
  quizzesTaken: number;
  pledges: string[];
}

interface Ctx extends State {
  addPoints: (n: number) => void;
  award: (id: BadgeId) => void;
  recordQuiz: (score: number, total: number) => void;
  addPledge: (text: string) => void;
  reset: () => void;
}

const KEY = "jala-gamification-v1";
const DEFAULT: State = { points: 0, badges: [], quizzesTaken: 0, pledges: [] };
const GameCtx = createContext<Ctx | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const award = (id: BadgeId) =>
      setState((s) => (s.badges.includes(id) ? s : { ...s, badges: [...s.badges, id] }));
    const addPoints = (n: number) =>
      setState((s) => {
        const points = Math.max(0, s.points + n);
        const badges = [...s.badges];
        if (points > 0 && !badges.includes("first_drop")) badges.push("first_drop");
        if (points >= 100 && !badges.includes("eco_hero")) badges.push("eco_hero");
        return { ...s, points, badges };
      });
    const recordQuiz = (score: number, total: number) =>
      setState((s) => {
        const badges = [...s.badges];
        if (!badges.includes("quiz_novice")) badges.push("quiz_novice");
        if (score === total && !badges.includes("quiz_master")) badges.push("quiz_master");
        const gained = score * 5;
        const points = s.points + gained;
        if (points > 0 && !badges.includes("first_drop")) badges.push("first_drop");
        if (points >= 100 && !badges.includes("eco_hero")) badges.push("eco_hero");
        return { ...s, badges, points, quizzesTaken: s.quizzesTaken + 1 };
      });
    const addPledge = (text: string) =>
      setState((s) => {
        const pledges = [text, ...s.pledges].slice(0, 50);
        const badges = [...s.badges];
        if (!badges.includes("pledger")) badges.push("pledger");
        const points = s.points + 10;
        if (points >= 100 && !badges.includes("eco_hero")) badges.push("eco_hero");
        if (!badges.includes("first_drop")) badges.push("first_drop");
        return { ...s, pledges, badges, points };
      });
    return { ...state, addPoints, award, recordQuiz, addPledge, reset: () => setState(DEFAULT) };
  }, [state]);

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGamification() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGamification must be used inside GamificationProvider");
  return ctx;
}
