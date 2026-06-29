"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StepCardProps {
  step: number;
  title: string;
  desc: string;
  children: ReactNode;
}

export function StepCard({ step, title, desc, children }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: -40, rotateY: 8 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      style={{ transformStyle: "preserve-3d" }}
      className="brand-gradient-border relative w-full rounded-2xl bg-white p-4 shadow-[0_20px_50px_rgba(30,91,168,0.12)]"
    >
      <div className="mb-3 flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 16 }}
          className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient-bg text-sm font-medium text-white"
          style={{ boxShadow: "0 6px 14px rgba(30,91,168,0.3)" }}
        >
          {step}
        </motion.div>
        <div>
          <h2 className="text-base font-medium text-text-primary">{title}</h2>
          <p className="text-[11px] text-text-secondary">{desc}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
