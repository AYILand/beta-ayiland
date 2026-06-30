"use client";

import { AyiMascot, type AyiPose } from "@/components/mascot/AyiMascot";

const POSES: AyiPose[] = [
  "pointing",
  "thinking",
  "typing",
  "celebrating",
  "presenting",
  "waving",
  "sleeping",
  "detective",
  "sad",
];

export default function MascotTestPage() {
  return (
    <main
      className="min-h-screen p-6"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <h1 className="mb-6 text-center text-2xl font-medium">Ayi — 9 poses</h1>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3">
        {POSES.map((pose) => (
          <div
            key={pose}
            className="rounded-2xl border border-border bg-white p-4 shadow-[0_20px_50px_-25px_rgba(30,91,168,0.3)]"
          >
            <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-widest text-brand-blue">
              {pose}
            </p>
            <div className="mx-auto w-full max-w-[200px]">
              <AyiMascot pose={pose} className="w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
