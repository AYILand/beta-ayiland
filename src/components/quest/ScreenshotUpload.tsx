"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Upload, ImageIcon, X, Check } from "lucide-react";

interface ScreenshotUploadProps {
  initial?: string;
  points: number;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function ScreenshotUpload({ initial, points, onUpload, onRemove }: ScreenshotUploadProps) {
  const t = useTranslations("upload");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    setError(null);
    if (!TYPES.includes(file.type)) {
      setError(t("invalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("tooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      onUpload(url);
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex items-center gap-3 rounded-xl border border-brand-green/40 bg-gradient-to-r from-brand-green/5 to-brand-blue/5 p-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Capture" className="h-14 w-20 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-brand-green">
            <Check size={12} />
            {t("uploaded")}
          </p>
          <p className="truncate text-xs text-text-secondary">+{points} XP</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition hover:border-red-400 hover:text-red-600"
          aria-label={t("remove")}
        >
          <X size={13} />
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={
          "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 transition " +
          (dragging
            ? "border-brand-blue bg-brand-blue/5"
            : "border-border bg-surface-soft hover:border-brand-blue hover:bg-white")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue">
          {dragging ? <Upload size={16} /> : <ImageIcon size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text-primary">{t("label")}</p>
          <p className="truncate text-[10px] text-text-muted">{t("hint")}</p>
        </div>
        <span className="hidden rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue sm:inline">
          +{points} XP
        </span>
      </label>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
