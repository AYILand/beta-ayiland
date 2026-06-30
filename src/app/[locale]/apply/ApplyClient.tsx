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
import { AlreadySubmitted } from "@/components/quest/AlreadySubmitted";
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
import {
  clearEmail,
  loadEmail,
  loadRefCode,
  loadSession,
  persistEmail,
  persistRefCode,
  useSession,
} from "@/lib/session";
import { uploadProof } from "@/lib/storage";

export default function ApplyClient() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: auth0User } = useUser();

  const [email, setEmail] = useState<string | null>(null);
  const [emailHydrated, setEmailHydrated] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [remoteSubmitted, setRemoteSubmitted] = useState<boolean | null>(null);
  const [remoteCandidate, setRemoteCandidate] = useState<{
    ref_code: string;
    display_mode: "name_initial" | "handle" | "anonymous" | "hidden";
    linkedin_handle: string | null;
  } | null>(null);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    if (urlRef && /^[a-z0-9]{6}$/i.test(urlRef)) {
      persistRefCode(urlRef);
    }
    const stored = loadEmail();
    if (stored) {
      setEmail(stored);
      setHasPrevious(!!loadSession(stored));
    }
    setEmailHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!email) {
      setRemoteSubmitted(null);
      return;
    }
    let cancelled = false;
    setRemoteSubmitted(null);
    fetch(`/api/candidate?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ candidate, referralCount }) => {
        if (cancelled) return;
        setRemoteSubmitted(!!candidate?.submitted_at);
        setRemoteCandidate(candidate ?? null);
        setReferralCount(referralCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) setRemoteSubmitted(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const { state, update, hydrated } = useSession(email);
  const [bursts, setBursts] = useState<{ id: string; points: number }[]>([]);
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ayiOverride, setAyiOverride] = useState<"celebrating" | null>(null);

  const ayiPose: import("@/components/mascot/AyiMascot").AyiPose = ayiOverride
    ? ayiOverride
    : state.step === 1
    ? "pointing"
    : state.step === 2
    ? "pointing"
    : state.step === 3
    ? "typing"
    : "presenting";

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
          setAyiOverride("celebrating");
          setTimeout(() => setAyiOverride(null), 1600);
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
      const refCode = loadRefCode();
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
          referredByRefCode: refCode ?? undefined,
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

  if (!hydrated || remoteSubmitted === null) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-tint" />;
  }

  if (state.done.submit || remoteSubmitted) {
    return (
      <AlreadySubmitted
        email={email}
        refCode={remoteCandidate?.ref_code ?? null}
        referralCount={referralCount}
        displayMode={remoteCandidate?.display_mode ?? "name_initial"}
        linkedinHandle={remoteCandidate?.linkedin_handle ?? state.data.linkedinHandle ?? null}
        onNewSession={() => {
          clearEmail();
          setEmail(null);
          setHasPrevious(false);
          setRemoteSubmitted(null);
          setRemoteCandidate(null);
        }}
      />
    );
  }

  return (
    <main
      className="relative flex h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />
      <PointsBurst bursts={bursts} />
      <AchievementToast achievement={latestAchievement} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/">
            <Image
              src={BETA_CONFIG.logoUrl}
              alt="AYILand"
              width={200}
              height={200}
              priority
              className="h-10 w-auto sm:h-12 lg:h-14"
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

        <div
          className="relative mt-3 overflow-hidden rounded-2xl border border-border bg-white/70 p-3 backdrop-blur-xl sm:p-4"
          style={{
            boxShadow:
              "0 18px 40px -20px rgba(30,91,168,0.25), 0 8px 18px -8px rgba(42,157,111,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(30,91,168,0.08), transparent 50%), radial-gradient(circle at 100% 100%, rgba(42,157,111,0.08), transparent 50%)",
            }}
          />
          <div className="relative">
            <XpBar xp={state.xp} />
            <div className="mt-3">
              <StepStones current={state.step} total={STEP_COUNT} />
            </div>
          </div>
        </div>

        <section className="mt-4 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] sm:gap-5 lg:grid-cols-[240px_1fr] lg:gap-8">
          <div className="flex flex-col items-center sm:items-start">
            <SpeechBubble message={stepMessage} />
            <div className="mt-2 w-32 sm:w-full sm:max-w-[160px] lg:max-w-[220px]">
              <AyiMascot pose={ayiPose} className="w-full" />
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
