"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/lib/flow";

interface AchievementToastProps {
  achievement: Achievement | null;
}

export function AchievementToast({ achievement }: AchievementToastProps) {
  const t = useTranslations("game");
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 sm:right-8">
      <AnimatePresence>
        {achievement && (
          <motion.div
            key={achievement}
            initial={{ x: 360, opacity: 0, scale: 0.85 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="brand-gradient-border relative flex w-72 items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_18px_40px_rgba(30,91,168,0.18)]"
          >
            <motion.div
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 14 }}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl brand-gradient-bg text-white"
              style={{ boxShadow: "0 8px 18px rgba(30,91,168,0.35)" }}
            >
              <Trophy size={22} />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-green">
                {t("achievementUnlocked")}
              </p>
              <p className="truncate text-sm font-medium text-text-primary">
                {t(`achievements.${achievement}.title`)}
              </p>
              <p className="truncate text-xs text-text-secondary">
                {t(`achievements.${achievement}.desc`)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
