"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface StepStonesProps {
  current: number;
  total: number;
}

export function StepStones({ current, total }: StepStonesProps) {
  const t = useTranslations("steps");
  const labels = [t("linkedin"), t("twitter"), t("contact"), t("submission")];

  return (
    <div className="flex w-full items-center justify-between gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const status: "done" | "current" | "pending" =
          idx < current ? "done" : idx === current ? "current" : "pending";
        return (
          <div key={idx} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={
                  status === "current"
                    ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(42,157,111,0.5)", "0 0 0 8px rgba(42,157,111,0)", "0 0 0 0 rgba(42,157,111,0)"] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.8, repeat: status === "current" ? Infinity : 0 }}
                className={
                  "relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium " +
                  (status === "done"
                    ? "brand-gradient-bg text-white"
                    : status === "current"
                    ? "border border-brand-green bg-white text-brand-green"
                    : "border border-border bg-white text-text-muted")
                }
              >
                {status === "done" ? <Check size={16} /> : idx}
              </motion.div>
              <span
                className={
                  "text-[10px] font-medium uppercase tracking-wider " +
                  (status === "pending" ? "text-text-muted" : "text-text-primary")
                }
              >
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div className="relative h-[2px] flex-1 overflow-hidden rounded bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 brand-gradient-bg"
                  initial={{ width: 0 }}
                  animate={{ width: idx < current ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
