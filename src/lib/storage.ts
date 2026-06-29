"use client";

import { supabaseBrowser } from "./supabase";

function safeName(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
}

export async function uploadProof(
  email: string,
  network: "linkedin" | "twitter",
  file: File,
): Promise<string> {
  const supabase = supabaseBrowser();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${safeName(email)}/${network}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("proofs")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("proofs").getPublicUrl(path);
  return data.publicUrl;
}

export async function dataUrlToFile(dataUrl: string, filename = "proof.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
