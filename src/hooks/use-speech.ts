import { useEffect, useRef, useState, useCallback } from "react";
import { VOICE_LOCALES, type LangCode } from "@/lib/translations";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export function useSpeechRecognition(lang: LangCode) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) as any;
    setSupported(!!SR);
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = VOICE_LOCALES[lang];
    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [lang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setTranscript("");
    try { recRef.current.start(); setListening(true); } catch {}
  }, []);
  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  return { supported, listening, transcript, start, stop, reset: () => setTranscript("") };
}

export function speak(text: string, lang: LangCode) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = VOICE_LOCALES[lang];
  u.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
