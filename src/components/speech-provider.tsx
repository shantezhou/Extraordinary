"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Ctx = {
  /** The key (e.g. "note-3" or "card-2-back") that is currently speaking. */
  speakingKey: string | null;
  supported: boolean;
  speak: (key: string, text: string) => void;
  stop: () => void;
};

const SpeechCtx = createContext<Ctx | null>(null);

/**
 * Single source of truth for browser SpeechSynthesis. The Web Speech API
 * has one global queue, so we mirror that with one global "speaking key" —
 * cards then derive their own "am I speaking?" state from it.
 */
export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((key: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    // Gentle, friendly cadence — tuned for a kid audience.
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.onend = () => setSpeakingKey((k) => (k === key ? null : k));
    utter.onerror = () => setSpeakingKey((k) => (k === key ? null : k));
    setSpeakingKey(key);
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeakingKey(null);
  }, []);

  return (
    <SpeechCtx.Provider value={{ speakingKey, supported, speak, stop }}>
      {children}
    </SpeechCtx.Provider>
  );
}

export function useSpeech() {
  const ctx = useContext(SpeechCtx);
  if (!ctx) throw new Error("useSpeech must be used inside <SpeechProvider>");
  return ctx;
}

/** Convenience for components that own one read-aloud surface. */
export function useSpeechFor(key: string) {
  const { speakingKey, supported, speak, stop } = useSpeech();
  const speaking = speakingKey === key;
  return {
    supported,
    speaking,
    toggle: (text: string) => (speaking ? stop() : speak(key, text)),
  };
}
