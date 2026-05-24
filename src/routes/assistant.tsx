import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mic, MicOff, Send, MessageCircle, Volume2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { chatWithAssistant } from "@/lib/chat.functions";
import { useSpeechRecognition, speak } from "@/hooks/use-speech";
import { LANG_NAMES_FOR_AI } from "@/lib/translations";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Water Assistant — Jala Rakshana" },
      { name: "description", content: "Ask anything about water conservation, harvesting, and schemes in your language." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const { t, lang, micEnabled, speakReplies } = useI18n();
  const chat = useServerFn(chatWithAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t("assistant_welcome") },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { supported, listening, transcript, start, stop } = useSpeechRecognition(lang);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Refresh welcome message when language changes & chat is fresh
  useEffect(() => {
    setMessages((m) => (m.length === 1 ? [{ role: "assistant", content: t("assistant_welcome") }] : m));
  }, [lang, t]);

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await chat({
        data: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          languageName: LANG_NAMES_FOR_AI[lang],
        },
      });
      if (res.ok) {
        setMessages([...next, { role: "assistant", content: res.reply }]);
        if (speakReplies) speak(res.reply, lang);
      } else {
        const key = res.error === "rate_limited" ? "rate_limited" : res.error === "no_credits" ? "no_credits" : "error_generic";
        setMessages([...next, { role: "assistant", content: t(key) }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...next, { role: "assistant", content: t("error_generic") }]);
    } finally {
      setBusy(false);
    }
  };

  const onMicToggle = () => {
    if (!micEnabled) return;
    if (listening) stop(); else start();
  };

  return (
    <div className="flex flex-col h-[100dvh] pb-24">
      <PageHeader title={t("assistant_title")} subtitle={t("assistant_sub")} icon={MessageCircle} variant="eco" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-soft ${
                m.role === "user"
                  ? "bg-hero text-primary-foreground rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {m.content}
              {m.role === "assistant" && i > 0 && (
                <button
                  onClick={() => speak(m.content, lang)}
                  className="block mt-2 text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  aria-label="Speak"
                >
                  <Volume2 className="size-3" /> play
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="glass rounded-3xl rounded-bl-md px-4 py-2.5 text-sm inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <Sparkles className="size-4" />
            </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2 sticky bottom-24">
        <div className="glass rounded-full p-1.5 flex items-center gap-1.5">
          <button
            onClick={onMicToggle}
            disabled={!supported || !micEnabled}
            aria-label={listening ? t("stop_voice") : t("start_voice")}
            className={`grid place-items-center size-11 rounded-full shrink-0 transition ${
              listening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : micEnabled && supported
                ? "bg-eco text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {micEnabled && supported ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={listening ? t("listening") : t("ask_placeholder")}
            className="flex-1 bg-transparent outline-none px-2 text-sm placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            aria-label={t("send")}
            className="grid place-items-center size-11 rounded-full bg-hero text-primary-foreground shadow-glow shrink-0 disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
