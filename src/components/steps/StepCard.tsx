"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface StepCardProps {
  step: number;
  title: string;
  desc: string;
  children: ReactNode;
}

export function StepCard({ step, title, desc, children }: StepCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rxSpring = useSpring(rx, { stiffness: 140, damping: 18 });
  const rySpring = useSpring(ry, { stiffness: 140, damping: 18 });

  const spotlight = useMotionTemplate`radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.55), transparent 55%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width;
    const dy = (e.clientY - rect.top) / rect.height;
    rx.set((0.5 - dy) * 14);
    ry.set((dx - 0.5) * 16);
    px.set(dx * 100);
    py.set(dy * 100);
  }
  function onPointerLeave() {
    rx.set(0);
    ry.set(0);
    px.set(50);
    py.set(50);
  }

  return (
    <div style={{ perspective: 1400 }} className="w-full">
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        initial={{ opacity: 0, y: 30, rotateX: -12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        style={{
          rotateX: rxSpring,
          rotateY: rySpring,
          transformStyle: "preserve-3d",
          boxShadow:
            "0 30px 60px -25px rgba(30,91,168,0.35), 0 18px 36px -18px rgba(42,157,111,0.25), 0 4px 12px rgba(15,31,51,0.06)",
        }}
        className="brand-gradient-border relative w-full rounded-2xl bg-white p-4 sm:p-5"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: spotlight, mixBlendMode: "soft-light" }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 30% 0%, rgba(30,91,168,0.18), transparent 60%), radial-gradient(circle at 70% 100%, rgba(42,157,111,0.15), transparent 65%)",
          }}
        />

        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          <div className="mb-3 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl brand-gradient-bg text-sm font-medium text-white"
              style={{
                boxShadow:
                  "0 10px 22px rgba(30,91,168,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                transform: "translateZ(20px)",
              }}
            >
              {step}
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.5) 0%, transparent 45%)",
                }}
              />
            </motion.div>
            <div>
              <h2 className="text-base font-medium text-text-primary">{title}</h2>
              <p className="text-[11px] text-text-secondary">{desc}</p>
            </div>
          </div>
          <div style={{ transform: "translateZ(20px)" }}>{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
