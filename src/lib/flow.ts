export type Achievement =
  | "firstStep"
  | "socialButterfly"
  | "loyalFan"
  | "readyToRoll"
  | "betaWarrior";

export type ActionId =
  | "connectLinkedin"
  | "followLinkedin"
  | "connectTwitter"
  | "followTwitter"
  | "fillEmail"
  | "fillWhatsapp"
  | "submit";

export const POINTS: Record<ActionId, number> = {
  connectLinkedin: 200,
  followLinkedin: 150,
  connectTwitter: 200,
  followTwitter: 150,
  fillEmail: 100,
  fillWhatsapp: 100,
  submit: 100,
};

export const MAX_XP = Object.values(POINTS).reduce((a, b) => a + b, 0);

// Bonus XP awarded to the referrer when a filleul completes their first submission.
// Non-visible to the user — pure backend logic that ranks referrers higher naturally.
export const REFERRAL_BONUS_XP = 500;

export const STEP_COUNT = 4;

export type FlowState = {
  step: 1 | 2 | 3 | 4;
  xp: number;
  done: Partial<Record<ActionId, true>>;
  achievements: Achievement[];
  data: {
    linkedinHandle?: string;
    twitterHandle?: string;
    linkedinProof?: string;
    twitterProof?: string;
    email?: string;
    whatsapp?: string;
  };
};

export const initialFlowState: FlowState = {
  step: 1,
  xp: 0,
  done: {},
  achievements: [],
  data: {},
};

export function award(state: FlowState, action: ActionId): FlowState {
  if (state.done[action]) return state;
  const xp = state.xp + POINTS[action];
  const done = { ...state.done, [action]: true as const };
  const next = { ...state, xp, done };
  return { ...next, achievements: deriveAchievements(next) };
}

function deriveAchievements(state: FlowState): Achievement[] {
  const list: Achievement[] = [...state.achievements];
  const add = (a: Achievement) => {
    if (!list.includes(a)) list.push(a);
  };
  if (state.done.connectLinkedin || state.done.connectTwitter) add("firstStep");
  if (state.done.connectLinkedin && state.done.connectTwitter) add("socialButterfly");
  if (state.done.followLinkedin && state.done.followTwitter) add("loyalFan");
  if (state.done.fillEmail && state.done.fillWhatsapp) add("readyToRoll");
  if (state.done.submit) add("betaWarrior");
  return list;
}
