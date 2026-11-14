import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MAX_HEARTS = 5;
export const HEART_REGEN_MINUTES = 30;
export const REFILL_HEARTS_COST = 60;
export const STREAK_FREEZE_COST = 120;
export const MAX_STREAK_FREEZES = 2;

const HEART_REGEN_MS = HEART_REGEN_MINUTES * 60 * 1000;

export const today = () => dayjs().format("YYYY-MM-DD");

export type LessonRecord = {
  completions: number;
  bestAccuracy: number;
};

export type FarolStats = {
  answered: number;
  correct: number;
  perfectLessons: number;
  bestCombo: number;
  challengesCompleted: number;
};

export type LessonResult = {
  lessonId: string;
  isChallenge: boolean;
  xp: number;
  coins: number;
  accuracy: number;
  answered: number;
  correct: number;
  bestCombo: number;
};

type FarolState = {
  name: string;
  dailyGoal: number;
  onboarded: boolean;
  xpTotal: number;
  xpByDate: Record<string, number>;
  activeDays: string[];
  streakFreezes: number;
  coins: number;
  hearts: number;
  heartsUpdatedAt: number;
  lessons: Record<string, LessonRecord>;
  stats: FarolStats;
  soundOn: boolean;

  completeOnboarding: (name: string, dailyGoal: number) => void;
  setDailyGoal: (goal: number) => void;
  toggleSound: () => void;
  syncHearts: () => void;
  loseHeart: () => void;
  refillHearts: () => boolean;
  buyStreakFreeze: () => boolean;
  finishLesson: (result: LessonResult) => void;
  reset: () => void;
};

const initialData = {
  name: "",
  dailyGoal: 30,
  onboarded: false,
  xpTotal: 0,
  xpByDate: {} as Record<string, number>,
  activeDays: [] as string[],
  streakFreezes: 0,
  coins: 50,
  hearts: MAX_HEARTS,
  heartsUpdatedAt: 0,
  lessons: {} as Record<string, LessonRecord>,
  stats: {
    answered: 0,
    correct: 0,
    perfectLessons: 0,
    bestCombo: 0,
    challengesCompleted: 0,
  } as FarolStats,
  soundOn: true,
};

/** Sequência atual: conta dias seguidos até hoje (ou até ontem, se hoje ainda não praticou) */
export const computeStreak = (activeDays: string[]): number => {
  const set = new Set(activeDays);
  let day = dayjs();
  if (!set.has(day.format("YYYY-MM-DD"))) day = day.subtract(1, "day");
  let streak = 0;
  while (set.has(day.format("YYYY-MM-DD"))) {
    streak += 1;
    day = day.subtract(1, "day");
  }
  return streak;
};

export const xpOn = (xpByDate: Record<string, number>, date: dayjs.Dayjs) =>
  xpByDate[date.format("YYYY-MM-DD")] ?? 0;

/** XP da semana atual (segunda a domingo) */
export const xpThisWeek = (xpByDate: Record<string, number>) => {
  const now = dayjs();
  const daysSinceMonday = (now.day() + 6) % 7;
  let total = 0;
  for (let i = 0; i <= daysSinceMonday; i++) {
    total += xpOn(xpByDate, now.subtract(i, "day"));
  }
  return total;
};

export const useFarolStore = create<FarolState>()(
  persist(
    (set, get) => ({
      ...initialData,

      completeOnboarding: (name, dailyGoal) =>
        set({ name: name.trim(), dailyGoal, onboarded: true }),

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      toggleSound: () => set({ soundOn: !get().soundOn }),

      syncHearts: () => {
        const { hearts, heartsUpdatedAt } = get();
        if (hearts >= MAX_HEARTS) return;
        const now = Date.now();
        const gained = Math.floor((now - heartsUpdatedAt) / HEART_REGEN_MS);
        if (gained <= 0) return;
        const newHearts = Math.min(MAX_HEARTS, hearts + gained);
        set({
          hearts: newHearts,
          heartsUpdatedAt:
            newHearts >= MAX_HEARTS
              ? now
              : heartsUpdatedAt + gained * HEART_REGEN_MS,
        });
      },

      loseHeart: () => {
        const { hearts, heartsUpdatedAt } = get();
        if (hearts <= 0) return;
        set({
          hearts: hearts - 1,
          heartsUpdatedAt: hearts >= MAX_HEARTS ? Date.now() : heartsUpdatedAt,
        });
      },

      refillHearts: () => {
        const { coins, hearts } = get();
        if (coins < REFILL_HEARTS_COST || hearts >= MAX_HEARTS) return false;
        set({
          coins: coins - REFILL_HEARTS_COST,
          hearts: MAX_HEARTS,
          heartsUpdatedAt: Date.now(),
        });
        return true;
      },

      buyStreakFreeze: () => {
        const { coins, streakFreezes } = get();
        if (coins < STREAK_FREEZE_COST || streakFreezes >= MAX_STREAK_FREEZES)
          return false;
        set({
          coins: coins - STREAK_FREEZE_COST,
          streakFreezes: streakFreezes + 1,
        });
        return true;
      },

      finishLesson: (result) => {
        const state = get();
        const todayStr = today();

        // Protetor de sequência: cobre os dias perdidos desde a última prática
        let activeDays = [...state.activeDays];
        let streakFreezes = state.streakFreezes;
        if (!activeDays.includes(todayStr) && activeDays.length > 0) {
          const last = activeDays.reduce((a, b) => (a > b ? a : b));
          const missed = dayjs(todayStr).diff(dayjs(last), "day") - 1;
          if (missed > 0 && missed <= streakFreezes) {
            for (let i = 1; i <= missed; i++) {
              activeDays.push(dayjs(last).add(i, "day").format("YYYY-MM-DD"));
            }
            streakFreezes -= missed;
          }
        }
        if (!activeDays.includes(todayStr)) activeDays.push(todayStr);
        activeDays = activeDays.slice(-400);

        const prev = state.lessons[result.lessonId];
        const perfect = result.accuracy === 1;

        set({
          xpTotal: state.xpTotal + result.xp,
          xpByDate: {
            ...state.xpByDate,
            [todayStr]: (state.xpByDate[todayStr] ?? 0) + result.xp,
          },
          coins: state.coins + result.coins,
          activeDays,
          streakFreezes,
          lessons: {
            ...state.lessons,
            [result.lessonId]: {
              completions: (prev?.completions ?? 0) + 1,
              bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, result.accuracy),
            },
          },
          stats: {
            answered: state.stats.answered + result.answered,
            correct: state.stats.correct + result.correct,
            perfectLessons: state.stats.perfectLessons + (perfect ? 1 : 0),
            bestCombo: Math.max(state.stats.bestCombo, result.bestCombo),
            challengesCompleted:
              state.stats.challengesCompleted + (result.isChallenge ? 1 : 0),
          },
        });
      },

      reset: () => set({ ...initialData }),
    }),
    {
      name: "farol-vendas",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
