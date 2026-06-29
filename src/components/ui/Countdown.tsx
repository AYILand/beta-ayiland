"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownProps {
  targetISO: string;
}

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ targetISO }: CountdownProps) {
  const t = useTranslations("landing.countdown");
  const target = new Date(targetISO).getTime();
  const [time, setTime] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setTime(diff(target));
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: Array<[number | null, string]> = [
    [time?.days ?? null, t("days")],
    [time?.hours ?? null, t("hours")],
    [time?.minutes ?? null, t("minutes")],
    [time?.seconds ?? null, t("seconds")],
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-xs uppercase tracking-widest text-text-secondary">{t("title")}</span>
      <div className="flex items-center gap-1.5">
        {cells.map(([value, label], i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center bg-white border border-border rounded-lg px-2 py-1 min-w-[42px]">
              <span className="text-base font-medium tabular-nums text-brand-blue">
                {value === null ? "--" : value.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-text-muted">{label}</span>
            </div>
            {i < cells.length - 1 && <span className="text-text-muted mx-0.5">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
