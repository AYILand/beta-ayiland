import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { Countdown } from "@/components/ui/Countdown";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { StageBackground } from "@/components/ui/StageBackground";
import { BETA_CONFIG } from "@/lib/config";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)",
      }}
    >
      <StageBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between">
          <Image
            src={BETA_CONFIG.logoUrl}
            alt="AYILand"
            width={200}
            height={200}
            priority
            style={{ height: 80, width: "auto" }}
          />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium tracking-widest text-brand-blue">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green"
                style={{ animation: "ay-pulse-ring 1.6s ease-in-out infinite" }}
              />
              {tc("betaAccess")}
            </span>
            <LangSwitcher />
          </div>
        </header>

        <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
          <div className="relative flex w-full max-w-sm shrink-0 justify-center lg:order-1">
            <AyiMascot state="pointing" className="w-72 lg:w-80" />
            <div
              aria-hidden
              className="absolute -bottom-3 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full bg-brand-blue/20 blur-md"
            />
          </div>

          <div className="text-center lg:order-2 lg:max-w-xl lg:text-left">
            <span className="inline-block rounded-full border border-border bg-white px-4 py-1.5 text-[11px] font-medium tracking-widest text-text-secondary">
              {tc("earlyAccess")}
            </span>
            <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {t("headlinePart1")}
              <br />
              <span className="brand-gradient-text">{t("headlinePart2")}</span>
            </h1>
            <p className="mt-3 text-sm text-text-secondary sm:text-base">{t("subtitle")}</p>

            <div className="mt-6 flex justify-center lg:justify-start">
              <Countdown targetISO={BETA_CONFIG.applicationsCloseAt} />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Link
                href="/apply"
                className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-7 py-3.5 text-sm font-medium text-white brand-gradient-bg shadow-[0_10px_24px_rgba(30,91,168,0.25)] transition hover:-translate-y-0.5"
              >
                <span className="relative z-10">{t("cta")} →</span>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  style={{ animation: "ay-shine 3s ease-in-out infinite" }}
                />
              </Link>
              <div className="flex items-center gap-5 text-xs text-text-secondary">
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">{BETA_CONFIG.totalSpots}</div>
                  <div>{t("stats.spots")}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-text-primary">7</div>
                  <div>{t("stats.daysLeft")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
