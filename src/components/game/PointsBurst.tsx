"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface PointsBurstProps {
  bursts: { id: string; points: number }[];
}

export function PointsBurst({ bursts }: PointsBurstProps) {
  const t = useTranslations("game");
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 30, scale: 0.6 }}
            animate={{ opacity: 1, y: -60, scale: 1.1 }}
            exit={{ opacity: 0, y: -120, scale: 1.2 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-3xl font-medium tracking-tight"
            style={{
              background: "linear-gradient(135deg, #1E5BA8, #2A9D6F)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 4px 12px rgba(30,91,168,0.35))",
            }}
          >
            {t("pointsAwarded", { points: b.points })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
