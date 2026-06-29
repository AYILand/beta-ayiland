"use client";

export type CustomQuest = {
  id: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  url?: string;
  points: number;
  requireScreenshot: boolean;
  active: boolean;
  position: number;
};

const QUESTS_KEY = "ayiland-custom-quests";

export function loadCustomQuests(): CustomQuest[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(QUESTS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as CustomQuest[]).sort((a, b) => a.position - b.position);
  } catch {
    return [];
  }
}

export function saveCustomQuests(quests: CustomQuest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
}

export function upsertCustomQuest(quest: CustomQuest) {
  const list = loadCustomQuests();
  const idx = list.findIndex((q) => q.id === quest.id);
  if (idx >= 0) list[idx] = quest;
  else list.push(quest);
  saveCustomQuests(list);
  return list;
}

export function removeCustomQuest(id: string) {
  const list = loadCustomQuests().filter((q) => q.id !== id);
  saveCustomQuests(list);
  return list;
}

export function newQuestId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
