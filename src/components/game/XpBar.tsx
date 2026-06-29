"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { MAX_XP } from "@/lib/flow";

interface XpBarProps {
  xp: number;
}

export function XpBar({ xp }: XpBarProps) {
  const t = useTranslations("game");
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v));
  const percent = useTransform(spring, (v) => `${(v / MAX_XP) * 100}%`);

  useEffect(() => {
    mv.set(xp);
  }, [xp, mv]);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium uppercase tracking-widest text-text-secondary">
          {t("xpLabel")}
        </span>
        <motion.span className="font-medium tabular-nums text-brand-blue">
          <motion.span>{display}</motion.span>
          <span className="text-text-secondary"> / {MAX_XP}</span>
        </motion.span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-border bg-surface-soft">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full brand-gradient-bg"
          style={{ width: percent }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              animation: "ay-shine 2.4s ease-in-out infinite",
            }}
          />
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent 0 19px, rgba(255,255,255,0.4) 19px 20px)",
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}
