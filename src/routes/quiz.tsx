import { createFileRoute } from "@tanstack/react-router";
import { Brain, Check, X, RotateCcw, Trophy } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGamification, BADGES } from "@/lib/gamification";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Water Quiz — Jala Rakshana" },
      { name: "description", content: "Test your water conservation knowledge and earn eco-points and badges." },
    ],
  }),
  component: QuizPage,
});

interface Q {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

const QUESTIONS: Q[] = [
  {
    q: "How much water can a dripping tap waste in a day?",
    options: ["1 litre", "5 litres", "15 litres", "50 litres"],
    answer: 2,
    explain: "A single dripping tap can waste ~15 litres of water every day.",
  },
  {
    q: "Which mission provides tap-water connections to every rural household in India?",
    options: ["Swachh Bharat", "Jal Jeevan Mission", "PMKSY", "Atal Bhujal"],
    answer: 1,
    explain: "Jal Jeevan Mission (JJM) targets 'Har Ghar Jal' — tap water in every rural home.",
  },
  {
    q: "Best time to water plants to reduce evaporation?",
    options: ["Noon", "Afternoon", "Early morning or evening", "Midnight"],
    answer: 2,
    explain: "Early morning or evening — the sun is low, so less water evaporates.",
  },
  {
    q: "Rainwater harvesting mainly helps by…",
    options: [
      "Cooling the atmosphere",
      "Recharging groundwater & storing usable water",
      "Cleaning the air",
      "Preventing earthquakes",
    ],
    answer: 1,
    explain: "It captures rainfall to recharge aquifers and provide usable stored water.",
  },
  {
    q: "Roughly what fraction of Earth's water is fresh and accessible?",
    options: ["~50%", "~25%", "~3%", "Less than 1%"],
    answer: 3,
    explain: "Less than 1% of Earth's water is fresh and easily accessible for human use.",
  },
];

function QuizPage() {
  const { recordQuiz, points, badges } = useGamification();
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[i];

  function choose(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 >= QUESTIONS.length) {
      const finalScore = score + (picked === q.answer ? 0 : 0);
      recordQuiz(finalScore, QUESTIONS.length);
      setDone(true);
      return;
    }
    setI((n) => n + 1);
    setPicked(null);
  }
  function restart() {
    setI(0); setPicked(null); setScore(0); setDone(false);
  }

  return (
    <div>
      <PageHeader title={t("quiz_title")} subtitle={`${t("eco_points")}: ${points}`} icon={Brain} variant="eco" />
      <main className="px-4 py-5 space-y-4">
        {!done ? (
          <section className="glass rounded-3xl p-5">
            <p className="text-xs text-muted-foreground">{t("question_x_of_y")} {i + 1} {t("of")} {QUESTIONS.length}</p>
            <h2 className="mt-2 font-semibold leading-snug">{q.q}</h2>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrect = picked !== null && idx === q.answer;
                const isWrong = picked === idx && idx !== q.answer;
                return (
                  <button
                    key={idx}
                    onClick={() => choose(idx)}
                    disabled={picked !== null}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition text-sm ${
                      isCorrect
                        ? "bg-[color:var(--leaf)]/15 border-[color:var(--leaf)] text-foreground"
                        : isWrong
                        ? "bg-destructive/10 border-destructive text-foreground"
                        : "bg-secondary border-transparent hover:bg-secondary/80"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {isCorrect && <Check className="size-4" />}
                      {isWrong && <X className="size-4" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">{q.explain}</p>
                <button
                  onClick={next}
                  className="mt-3 w-full rounded-2xl bg-hero text-primary-foreground py-2.5 font-medium shadow-glow"
                >
                  {i + 1 >= QUESTIONS.length ? t("finish") : t("next")}
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className="glass rounded-3xl p-6 text-center">
            <Trophy className="size-10 mx-auto text-[color:var(--leaf)]" />
            <h2 className="mt-3 text-xl font-bold">{t("you_scored")} {score} / {QUESTIONS.length}</h2>
            <p className="mt-1 text-sm text-muted-foreground">+{score * 5} {t("points_added")}</p>
            <button
              onClick={restart}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-hero text-primary-foreground px-4 py-2 text-sm font-medium shadow-glow"
            >
              <RotateCcw className="size-4" /> {t("try_again")}
            </button>
          </section>
        )}

        <section className="glass rounded-3xl p-5">
          <h3 className="text-sm font-semibold">{t("your_badges")}</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {BADGES.map((b) => {
              const owned = badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-2 text-center border transition ${
                    owned ? "bg-[color:var(--leaf)]/10 border-[color:var(--leaf)]" : "bg-muted/40 border-transparent opacity-50"
                  }`}
                  title={`${b.name} — ${b.desc}`}
                >
                  <div className="text-lg">{b.emoji}</div>
                  <div className="text-[9px] leading-tight mt-0.5">{b.name}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
