"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Lock, ExternalLink, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  loadCustomQuests,
  newQuestId,
  removeCustomQuest,
  upsertCustomQuest,
  type CustomQuest,
} from "@/lib/quests-config";

const BUILTIN_QUESTS = [
  { key: "connectLinkedin", points: 200 },
  { key: "followLinkedin", points: 150 },
  { key: "connectTwitter", points: 200 },
  { key: "followTwitter", points: 150 },
  { key: "fillEmail", points: 100 },
  { key: "fillWhatsapp", points: 100 },
  { key: "submit", points: 100 },
];

const BUILTIN_LABELS_FR: Record<string, string> = {
  connectLinkedin: "Connexion LinkedIn",
  followLinkedin: "Preuve follow LinkedIn",
  connectTwitter: "Connexion X",
  followTwitter: "Preuve follow X",
  fillEmail: "E-mail",
  fillWhatsapp: "WhatsApp",
  submit: "Soumission finale",
};

export function QuestsManager() {
  const t = useTranslations("admin.quests");
  const [quests, setQuests] = useState<CustomQuest[]>([]);
  const [editing, setEditing] = useState<CustomQuest | null>(null);

  useEffect(() => {
    setQuests(loadCustomQuests());
  }, []);

  function startNew() {
    setEditing({
      id: newQuestId(),
      titleFr: "",
      titleEn: "",
      descFr: "",
      descEn: "",
      url: "",
      points: 100,
      requireScreenshot: false,
      active: true,
      position: quests.length,
    });
  }

  function save(q: CustomQuest) {
    setQuests(upsertCustomQuest(q));
    setEditing(null);
  }

  function remove(id: string) {
    setQuests(removeCustomQuest(id));
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">{t("subtitle")}</p>
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-lg brand-gradient-bg px-3 py-2 text-xs font-medium text-white"
          style={{ boxShadow: "0 8px 20px rgba(30,91,168,0.25)" }}
        >
          <Plus size={14} />
          {t("add")}
        </button>
      </header>

      <section className="mt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-secondary">{t("builtin")}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BUILTIN_QUESTS.map((q) => (
            <div
              key={q.key}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-soft px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <Lock size={12} className="text-text-muted" />
                <span className="font-medium text-text-primary">{BUILTIN_LABELS_FR[q.key]}</span>
              </div>
              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">
                +{q.points} XP
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-secondary">{t("custom")}</p>
        {quests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface-soft px-3 py-6 text-center text-xs text-text-muted">
            {t("empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence>
              {quests.map((q) => (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{q.titleFr}</span>
                      {!q.active && (
                        <span className="rounded-full bg-text-muted/10 px-2 py-0.5 text-[10px] text-text-muted">
                          {t("inactive")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-text-secondary">{q.descFr}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 font-medium text-brand-blue">
                        +{q.points} XP
                      </span>
                      {q.url && (
                        <span className="inline-flex items-center gap-1">
                          <ExternalLink size={11} />
                          link
                        </span>
                      )}
                      {q.requireScreenshot && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon size={11} />
                          proof
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(q)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition hover:border-border-strong"
                      aria-label={t("edit")}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(q.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300"
                      aria-label={t("delete")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <QuestEditor
        quest={editing}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
    </div>
  );
}

interface QuestEditorProps {
  quest: CustomQuest | null;
  onCancel: () => void;
  onSave: (q: CustomQuest) => void;
}

function QuestEditor({ quest, onCancel, onSave }: QuestEditorProps) {
  const t = useTranslations("admin.quests.form");
  const [draft, setDraft] = useState<CustomQuest | null>(null);

  useEffect(() => {
    setDraft(quest);
  }, [quest]);

  if (!draft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,520px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-[0_20px_50px_rgba(30,91,168,0.18)]"
      >
        <h3 className="text-lg font-medium text-text-primary">
          <span className="brand-gradient-text">{draft.titleFr || "—"}</span>
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("titleFr")} value={draft.titleFr} onChange={(v) => setDraft({ ...draft, titleFr: v })} />
          <Field label={t("titleEn")} value={draft.titleEn} onChange={(v) => setDraft({ ...draft, titleEn: v })} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("descFr")} value={draft.descFr} onChange={(v) => setDraft({ ...draft, descFr: v })} />
          <Field label={t("descEn")} value={draft.descEn} onChange={(v) => setDraft({ ...draft, descEn: v })} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("url")} value={draft.url ?? ""} onChange={(v) => setDraft({ ...draft, url: v })} />
          <Field
            label={t("points")}
            type="number"
            value={String(draft.points)}
            onChange={(v) => setDraft({ ...draft, points: Number(v) || 0 })}
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-text-primary">
          <input
            type="checkbox"
            checked={draft.requireScreenshot}
            onChange={(e) => setDraft({ ...draft, requireScreenshot: e.target.checked })}
          />
          {t("requireScreenshot")}
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-border-strong"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-lg brand-gradient-bg px-4 py-2 text-xs font-medium text-white"
            style={{ boxShadow: "0 8px 20px rgba(30,91,168,0.25)" }}
          >
            {t("save")}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-text-secondary">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface-soft px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,91,168,0.08)]"
      />
    </label>
  );
}
