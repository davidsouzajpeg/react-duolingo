import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TRAIL_VERSION, allLessons } from "./content";

export const STREAK_FREEZE_COST = 120;
export const MAX_STREAK_FREEZES = 2;


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

/** Aviso ao gestor de que o vendedor concluiu a trilha (ver notify.ts) */
export type GestorNotice = {
  status: "nenhum" | "pendente" | "enviado";
  /** ISO de quando o servidor confirmou o recebimento */
  sentAt?: string;
  /** versão da trilha a que o aviso se refere */
  trailVersion: string;
};

export const isTrailComplete = (lessons: Record<string, LessonRecord>) =>
  allLessons.every(({ lesson }) => (lessons[lesson.id]?.completions ?? 0) > 0);

type FarolState = {
  name: string;
  dailyGoal: number;
  onboarded: boolean;
  xpTotal: number;
  xpByDate: Record<string, number>;
  activeDays: string[];
  streakFreezes: number;
  coins: number;
  lessons: Record<string, LessonRecord>;
  stats: FarolStats;
  soundOn: boolean;
  /** ISO da primeira vez em que todas as lições da versão atual foram concluídas */
  trailCompletedAt: string | null;
  gestorNotice: GestorNotice;

  completeOnboarding: (name: string, dailyGoal: number) => void;
  setDailyGoal: (goal: number) => void;
  toggleSound: () => void;
  buyStreakFreeze: () => boolean;
  finishLesson: (result: LessonResult) => void;
  /** marca a conclusão da trilha (uma vez por versão) e deixa o aviso pendente */
  syncTrailCompletion: () => void;
  markGestorNotified: (trailVersion: string) => void;
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
  lessons: {} as Record<string, LessonRecord>,
  stats: {
    answered: 0,
    correct: 0,
    perfectLessons: 0,
    bestCombo: 0,
    challengesCompleted: 0,
  } as FarolStats,
  soundOn: true,
  trailCompletedAt: null as string | null,
  gestorNotice: { status: "nenhum", trailVersion: "" } as GestorNotice,
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
        get().syncTrailCompletion();
      },

      syncTrailCompletion: () => {
        const { lessons, gestorNotice } = get();
        if (!isTrailComplete(lessons)) return;
        // já registrado para esta versão da trilha
        if (gestorNotice.trailVersion === TRAIL_VERSION) return;
        set({
          trailCompletedAt: new Date().toISOString(),
          gestorNotice: { status: "pendente", trailVersion: TRAIL_VERSION },
        });
      },

      markGestorNotified: (trailVersion) => {
        const { gestorNotice } = get();
        if (gestorNotice.trailVersion !== trailVersion) return;
        set({
          gestorNotice: {
            status: "enviado",
            sentAt: new Date().toISOString(),
            trailVersion,
          },
        });
      },

      reset: () => set({ ...initialData }),
    }),
    {
      name: "farol-vendas",
      storage: createJSONStorage(() => localStorage),
      // v2: a trilha passou a ser a linha "Venda Consultiva" (Open). Os ids
      // u1-l1… continuam, mas apontam para lições novas: mantemos XP, moedas,
      // sequência e estatísticas, e zeramos o progresso por lição.
      // v3: conclusão da trilha + aviso ao gestor.
      version: 3,
      migrate: (persisted, version) => {
        let state = (persisted ?? {}) as Partial<FarolState>;
        if (version < 2) state = { ...state, lessons: {} };
        if (version < 3) {
          state = {
            ...state,
            trailCompletedAt: state.trailCompletedAt ?? null,
            gestorNotice: state.gestorNotice ?? {
              status: "nenhum",
              trailVersion: "",
            },
          };
        }
        return state as FarolState;
      },
    },
  ),
);
