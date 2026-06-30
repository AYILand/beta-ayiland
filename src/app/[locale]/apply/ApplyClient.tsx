"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { XpBar } from "@/components/game/XpBar";
import { StepStones } from "@/components/game/StepStones";
import { PointsBurst } from "@/components/game/PointsBurst";
import { AchievementToast } from "@/components/game/AchievementToast";
import { SpeechBubble } from "@/components/game/SpeechBubble";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { Step1Linkedin } from "@/components/steps/Step1Linkedin";
import { Step2Twitter } from "@/components/steps/Step2Twitter";
import { Step3Contact } from "@/components/steps/Step3Contact";
import { Step4Recap } from "@/components/steps/Step4Recap";
import { EmailGate } from "@/components/quest/EmailGate";
import { Link, useRouter } from "@/i18n/navigation";
import { BETA_CONFIG } from "@/lib/config";
import {
  award,
  initialFlowState,
  POINTS,
  STEP_COUNT,
  type FlowState,
  type ActionId,
  type Achievement,
} from "@/lib/flow";
import { clearEmail, loadEmail, loadSession, persistEmail, useSession } from "@/lib/session";
import { uploadProof } from "@/lib/storage";

export default function ApplyClient() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: auth0User } = useUser();

  const [email, setEmail] = useState<string | null>(null);
  const [emailHydrated, setEmailHydrated] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    const stored = loadEmail();
    if (stored) {
      setEmail(stored);
      setHasPrevious(!!loadSession(stored));
    }
    setEmailHydrated(true);
  }, []);

  const { state, update, hydrated } = useSession(email);
  const [bursts, setBursts] = useState<{ id: string; points: number }[]>([]);
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ayiState, setAyiState] = useState<"idle" | "pointing" | "celebrating">("pointing");

  const stepMessage = useMemo(() => {
    switch (state.step) {
      case 1:
        return t("steps.step1.ayiMessage");
      case 2:
        return t("steps.step2.ayiMessage");
      case 3:
        return t("steps.step3.ayiMessage");
      case 4:
        return t("steps.step4.ayiMessage");
    }
  }, [state.step, t]);

  function performAction(action: ActionId, mutator?: (prev: FlowState) => FlowState) {
    update((prev) => {
      let next = mutator ? mutator(prev) : prev;
      if (!next.done[action]) {
        next = award(next, action);
        setBursts((b) => [
          ...b,
          {
            id: `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            points: POINTS[action],
          },
        ]);
        const fresh = next.achievements.find((a) => !prev.achievements.includes(a));
        if (fresh) {
          setLatestAchievement(fresh);
          setAyiState("celebrating");
          setTimeout(() => setAyiState("pointing"), 1600);
        }
      }
      return next;
    });
  }

  useEffect(() => {
    if (!email || !auth0User || !hydrated) return;
    const connected = searchParams.get("connected");
    if (!connected) return;

    const handle =
      (auth0User.nickname as string) ||
      (auth0User.name as string) ||
      (auth0User.sub as string)?.split("|").pop() ||
      "";

    if (connected === "linkedin" && !state.done.connectLinkedin) {
      performAction("connectLinkedin", (p) => ({
        ...p,
        data: { ...p.data, linkedinHandle: handle },
      }));
    } else if (connected === "twitter" && !state.done.connectTwitter) {
      performAction("connectTwitter", (p) => ({
        ...p,
        data: { ...p.data, twitterHandle: handle },
      }));
    }
    router.replace(`/apply`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0User, email, hydrated, searchParams]);

  useEffect(() => {
    if (bursts.length === 0) return;
    const oldest = bursts[0];
    const id = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== oldest.id)), 1400);
    return () => clearTimeout(id);
  }, [bursts]);

  useEffect(() => {
    if (!latestAchievement) return;
    const id = setTimeout(() => setLatestAchievement(null), 3200);
    return () => clearTimeout(id);
  }, [latestAchievement]);

  function canAdvance(): boolean {
    if (state.step === 1) return !!state.done.connectLinkedin && !!state.done.followLinkedin;
    if (state.step === 2) return !!state.done.connectTwitter && !!state.done.followTwitter;
    if (state.step === 3) return !!state.done.fillEmail && !!state.done.fillWhatsapp;
    return false;
  }

  function goNext() {
    if (!canAdvance() || state.step >= STEP_COUNT) return;
    update((p) => ({ ...p, step: (p.step + 1) as FlowState["step"] }));
  }
  function goBack() {
    if (state.step <= 1) return;
    update((p) => ({ ...p, step: (p.step - 1) as FlowState["step"] }));
  }

  async function handleSubmit() {
    if (!email) return;
    setSubmitting(true);
    performAction("submit");
    try {
      await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          xp: state.xp + POINTS.submit,
          linkedinHandle: state.data.linkedinHandle,
          twitterHandle: state.data.twitterHandle,
          whatsapp: state.data.whatsapp,
          linkedinProofUrl: state.data.linkedinProof,
          twitterProofUrl: state.data.twitterProof,
          flowState: { ...state, xp: state.xp + POINTS.submit },
          submit: true,
        }),
      });
    } catch (err) {
      console.error("Submit failed", err);
    }
    setTimeout(() => router.push("/apply/success"), 900);
  }

  if (!emailHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-tint" />
    );
  }

  if (!email) {
    return (
      <EmailGate
        hasPrevious={false}
        onSubmit={(e) => {
          persistEmail(e);
          setEmail(e);
          setHasPrevious(!!loadSession(e));
        }}
      />
    );
  }

  if (!hydrated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-tint" />;
  }

  return (
    <main
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />
      <PointsBurst bursts={bursts} />
      <AchievementToast achievement={latestAchievement} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-4 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/">
            <Image
              src={BETA_CONFIG.logoUrl}
              alt="AYILand"
              width={200}
              height={200}
              priority
              style={{ height: 64, width: "auto" }}
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-white px-3 py-1.5 text-[10px] font-medium tracking-widest text-text-secondary sm:inline">
              {t("game.currentStep", { current: state.step, total: STEP_COUNT })}
            </span>
            <button
              type="button"
              onClick={() => {
                clearEmail();
                setEmail(null);
              }}
              className="hidden truncate text-[10px] text-text-muted underline-offset-2 hover:text-brand-blue hover:underline sm:inline"
              title={email}
            >
              {email}
            </button>
            <LangSwitcher />
          </div>
        </header>

        <div className="mt-3 rounded-xl border border-border bg-white/70 p-3 backdrop-blur">
          <XpBar xp={state.xp} />
          <div className="mt-3">
            <StepStones current={state.step} total={STEP_COUNT} />
          </div>
        </div>

        <section
          className="mt-4 grid flex-1 gap-4 sm:gap-6 lg:gap-8"
          style={{ gridTemplateColumns: "180px 1fr" }}
        >
          <div className="flex flex-col items-center">
            <SpeechBubble message={stepMessage} />
            <div className="mt-2 w-full max-w-[200px]">
              <AyiMascot state={ayiState} className="w-full" />
            </div>
          </div>

          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div key={state.step} className="w-full">
                {state.step === 1 && (
                  <Step1Linkedin
                    state={state}
                    onFollowProof={async (file) => {
                      if (!email) return;
                      const publicUrl = await uploadProof(email, "linkedin", file);
                      performAction("followLinkedin", (p) => ({
                        ...p,
                        data: { ...p.data, linkedinProof: publicUrl },
                      }));
                    }}
                    onFollowReset={() =>
                      update((p) => {
                        const next = {
                          ...p,
                          data: { ...p.data, linkedinProof: undefined },
                          done: { ...p.done },
                          xp: p.xp,
                        };
                        if (next.done.followLinkedin) {
                          delete next.done.followLinkedin;
                          next.xp = Math.max(0, next.xp - POINTS.followLinkedin);
                        }
                        return next;
                      })
                    }
                  />
                )}
                {state.step === 2 && (
                  <Step2Twitter
                    state={state}
                    onFollowProof={async (file) => {
                      if (!email) return;
                      const publicUrl = await uploadProof(email, "twitter", file);
                      performAction("followTwitter", (p) => ({
                        ...p,
                        data: { ...p.data, twitterProof: publicUrl },
                      }));
                    }}
                    onFollowReset={() =>
                      update((p) => {
                        const next = {
                          ...p,
                          data: { ...p.data, twitterProof: undefined },
                          done: { ...p.done },
                          xp: p.xp,
                        };
                        if (next.done.followTwitter) {
                          delete next.done.followTwitter;
                          next.xp = Math.max(0, next.xp - POINTS.followTwitter);
                        }
                        return next;
                      })
                    }
                  />
                )}
                {state.step === 3 && (
                  <Step3Contact
                    state={state}
                    onEmail={(emailValue) =>
                      performAction("fillEmail", (p) => ({
                        ...p,
                        data: { ...p.data, email: emailValue },
                      }))
                    }
                    onWhatsapp={(whatsapp) =>
                      performAction("fillWhatsapp", (p) => ({
                        ...p,
                        data: { ...p.data, whatsapp },
                      }))
                    }
                  />
                )}
                {state.step === 4 && (
                  <Step4Recap state={state} onSubmit={handleSubmit} submitting={submitting} />
                )}
              </motion.div>
            </AnimatePresence>

            {state.step < 4 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={state.step === 1}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-border-strong disabled:opacity-40"
                >
                  <ArrowLeft size={14} />
                  {t("common.back")}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 rounded-lg brand-gradient-bg px-4 py-2 text-xs font-medium text-white transition disabled:opacity-50"
                  style={{ boxShadow: "0 8px 20px rgba(30,91,168,0.25)" }}
                >
                  {t("common.continue")}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
