"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopped";

export type UseRecorder = {
  status: RecorderStatus;
  elapsedMs: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  mimeType: string | null;
  /** 0..1 instantaneous RMS mic level for visualization. */
  level: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

// Whisper accepts webm/mp4/m4a/mp3/wav/ogg. Pick the first one this browser
// can actually produce so we don't bake an unsupported MIME.
function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function useRecorder(): UseRecorder {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  const teardownStream = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    tickRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(
    () => () => {
      teardownStream();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    },
    [teardownStream],
  );

  const start = useCallback(async () => {
    setError(null);
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferred = pickMimeType();
      const rec = new MediaRecorder(
        stream,
        preferred ? { mimeType: preferred } : undefined,
      );
      recorderRef.current = rec;
      setMimeType(rec.mimeType || preferred || "audio/webm");

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setStatus("stopped");
        teardownStream();
      };

      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (Ctor) {
        const ctx = new Ctor();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyserRef.current = analyser;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const loop = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = ((buf[i] ?? 128) - 128) / 128;
            sum += v * v;
          }
          setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 2.5));
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      }

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      tickRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);

      rec.start();
      setStatus("recording");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === "NotAllowedError"
            ? "Mic access was blocked. Allow it in your browser to record."
            : err.message
          : "Couldn't start the mic. Try again?";
      setError(msg);
      teardownStream();
      setStatus("idle");
    }
  }, [teardownStream]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);

  const reset = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    setAudioBlob(null);
    setAudioUrl(null);
    setMimeType(null);
    setStatus("idle");
    setElapsedMs(0);
    setLevel(0);
    setError(null);
  }, []);

  return {
    status,
    elapsedMs,
    audioBlob,
    audioUrl,
    mimeType,
    level,
    error,
    start,
    stop,
    reset,
  };
}
