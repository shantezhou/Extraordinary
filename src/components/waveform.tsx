"use client";

import { motion } from "framer-motion";

type Props = {
  level: number;
  active: boolean;
  bars?: number;
};

/**
 * Tiny equalizer-style bar visualizer. The center bars react strongest to mic
 * level so quiet rooms still look alive without overstating loud spikes.
 */
export function Waveform({ level, active, bars = 16 }: Props) {
  return (
    <div className="flex h-16 items-center gap-1.5" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = (i - (bars - 1) / 2) / bars;
        const centerWeight = 1 - Math.abs(phase) * 1.3;
        const target = active
          ? Math.max(0.12, Math.min(1, 0.18 + level * centerWeight * 1.9))
          : 0.12;
        return (
          <motion.span
            key={i}
            className="block w-2 origin-center rounded-full bg-primary"
            animate={{ scaleY: target }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{ height: "100%" }}
          />
        );
      })}
    </div>
  );
}
