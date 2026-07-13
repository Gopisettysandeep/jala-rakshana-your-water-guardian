import { createFileRoute } from "@tanstack/react-router";
import { Users, Send, HandHeart } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGamification } from "@/lib/gamification";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Pledges — Jala Rakshana" },
      { name: "description", content: "Make a water-saving pledge and see pledges from your community." },
    ],
  }),
  component: CommunityPage,
});

const SEED = [
  "I will fix all leaking taps at home this week.",
  "I'll install a rainwater harvesting pit before monsoon.",
  "I will reuse RO reject water for my garden.",
  "I'll switch to a bucket instead of a hose for washing.",
];

function CommunityPage() {
  const { pledges, addPledge, points } = useGamification();
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    addPledge(t);
    setText("");
  }

  const all = [...pledges, ...SEED];

  return (
    <div>
      <PageHeader title="Community Pledges" subtitle={`+10 points per pledge · Total ${points}`} icon={Users} variant="eco" />
      <main className="px-4 py-5 space-y-4">
        <form onSubmit={submit} className="glass rounded-3xl p-4">
          <label className="text-xs text-muted-foreground">Your pledge</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="I promise to…"
            className="mt-1 w-full resize-none rounded-2xl bg-background border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-hero text-primary-foreground px-4 py-2 text-sm font-medium shadow-glow disabled:opacity-50"
            disabled={!text.trim()}
          >
            <Send className="size-4" /> Post pledge
          </button>
        </form>

        <section className="space-y-2">
          {all.map((p, idx) => (
            <div key={idx} className="glass rounded-2xl p-3 flex gap-3">
              <HandHeart className="size-5 shrink-0 text-[color:var(--leaf)] mt-0.5" />
              <div>
                <p className="text-sm leading-relaxed">{p}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {idx < pledges.length ? "You" : "Community member"}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
