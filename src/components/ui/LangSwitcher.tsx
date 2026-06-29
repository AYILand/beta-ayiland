"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = locale === "fr" ? "en" : "fr";

  return (
    <button
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: switchTo });
        })
      }
      disabled={isPending}
      className="text-xs font-medium tracking-widest text-text-secondary hover:text-brand-blue transition px-3 py-1.5 rounded-full border border-border bg-white"
      aria-label={`Switch to ${switchTo.toUpperCase()}`}
    >
      {switchTo.toUpperCase()}
    </button>
  );
}
