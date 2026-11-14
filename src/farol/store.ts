import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TRAIL_VERSION, allLessons, units } from "./content";
import { GIFT_AFTER_LESSON, giftOfUnit } from "./presentes";
import {
  PROMOTION_COINS,
  TOP_DIVISION,
  buildLeague,
  weekKeyOf,
  zoneOf,
  type LeagueOutcome,
} from "./gamification";
import {
  SIM_COINS_FIRST,
  SIM_XP_FIRST,
  SIM_XP_REPEAT,
  type Competencia,
  type SimEvaluation,
} from "./simulador";
import {
  defaultAvatar,
  findItem,
  type AvatarConfig,
  type ItemSlot,
} from "./shop";

/** Bloqueio de ofensiva: protege a ofensiva em um dia sem prática */
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

/** Resultado da última semana encerrada na divisão */
export type LeagueResult = {
  week: string;
  fromTier: number;
  toTier: number;
  position: number;
  xp: number;
  outcome: LeagueOutcome;
  coins: number;
  seen: boolean;
};

export type LeagueState = {
  /** índice em `divisions` */
  tier: number;
  /** segunda-feira da semana em disputa (YYYY-MM-DD) */
  week: string;
  lastResult: LeagueResult | null;
};

/** O que o vendedor recebeu ao abrir um presente */
export type GiftResult =
  | { kind: "moedas"; amount: number; insteadOf?: string }
  | { kind: "faiscas"; amount: number }
  | { kind: "item"; itemId: string; name: string };

/** Melhor resultado e tentativas em cada cenário do simulador */
export type SimRecord = { attempts: number; best: number };

/** Uma simulação concluída (histórico) */
export type SimHistoryEntry = {
  id: string;
  date: string;
  geral: number;
  por: { id: Competencia; pct: number }[];
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
  /** dias sem prática cobertos por um bloqueio de ofensiva */
  frozenDays: string[];
  /** dias que o bloqueio acabou de salvar (aviso na trilha) */
  freezeNotice: string[];
  bestStreak: number;
  streakFreezes: number;
  coins: number;
  avatar: AvatarConfig;
  ownedItems: string[];
  league: LeagueState;
  lessons: Record<string, LessonRecord>;
  sims: Record<string, SimRecord>;
  simHistory: SimHistoryEntry[];
  /** presentes da trilha já recebidos (id da unidade) */
  gifts: string[];
  /** recebe o presente de uma unidade; devolve o que entrou de fato */
  claimGift: (unitId: string) => GiftResult | null;
  /** linha de treino aberta na trilha */
  linhaAtiva: string;
  setLinhaAtiva: (id: string) => void;
  stats: FarolStats;
  soundOn: boolean;
  /** ISO da primeira vez em que todas as lições da versão atual foram concluídas */
  trailCompletedAt: string | null;
  gestorNotice: GestorNotice;

  completeOnboarding: (name: string, dailyGoal: number) => void;
  setDailyGoal: (goal: number) => void;
  toggleSound: () => void;
  buyStreakFreeze: () => boolean;
  /** usa bloqueios para cobrir dias perdidos (ao abrir o app e ao concluir lição) */
  syncStreak: () => void;
  dismissFreezeNotice: () => void;
  setAvatar: (patch: Partial<Omit<AvatarConfig, "equipped">>) => void;
  buyItem: (id: string) => boolean;
  equipItem: (slot: ItemSlot, id: string | null) => void;
  /** fecha a semana anterior da divisão: sobe, permanece ou desce */
  syncLeague: () => void;
  markLeagueResultSeen: () => void;
  finishLesson: (result: LessonResult) => void;
  /** registra uma simulação e devolve a recompensa (reduzida nas repetições) */
  finishSimulation: (id: string, evaluation: SimEvaluation) => { xp: number; coins: number };
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
  frozenDays: [] as string[],
  freezeNotice: [] as string[],
  bestStreak: 0,
  streakFreezes: 0,
  coins: 50,
  avatar: defaultAvatar,
  ownedItems: [] as string[],
  league: { tier: 0, week: "", lastResult: null } as LeagueState,
  lessons: {} as Record<string, LessonRecord>,
  linhaAtiva: "consultiva",
  gifts: [] as string[],
  sims: {} as Record<string, SimRecord>,
  simHistory: [] as SimHistoryEntry[],
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

/**
 * Ofensiva atual: dias seguidos de prática até hoje (ou até ontem, se hoje
 * ainda não praticou). Dias cobertos por bloqueio mantêm a ofensiva, mas não
 * somam.
 */
export const computeStreak = (
  activeDays: string[],
  frozenDays: string[] = [],
): number => {
  const active = new Set(activeDays);
  const frozen = new Set(frozenDays);
  const key = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
  let day = dayjs();
  if (!active.has(key(day)) && !frozen.has(key(day))) day = day.subtract(1, "day");
  let streak = 0;
  while (active.has(key(day)) || frozen.has(key(day))) {
    if (active.has(key(day))) streak += 1;
    day = day.subtract(1, "day");
  }
  return streak;
};

export const xpOn = (xpByDate: Record<string, number>, date: dayjs.Dayjs) =>
  xpByDate[date.format("YYYY-MM-DD")] ?? 0;

/** XP de uma semana (segunda a domingo), dada a segunda-feira dela */
export const xpOfWeek = (xpByDate: Record<string, number>, weekKey: string) => {
  let total = 0;
  for (let i = 0; i < 7; i++) total += xpOn(xpByDate, dayjs(weekKey).add(i, "day"));
  return total;
};

/** XP da semana atual */
export const xpThisWeek = (xpByDate: Record<string, number>) =>
  xpOfWeek(xpByDate, weekKeyOf());

export const useFarolStore = create<FarolState>()(
  persist(
    (set, get) => ({
      ...initialData,

      completeOnboarding: (name, dailyGoal) =>
        set({ name: name.trim(), dailyGoal, onboarded: true }),

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      setLinhaAtiva: (linhaAtiva) => set({ linhaAtiva }),

      claimGift: (unitId) => {
        const gift = giftOfUnit(unitId);
        const state = get();
        if (!gift || state.gifts.includes(unitId)) return null;
        // só libera depois de concluir a lição que vem antes do presente
        const unit = units.find((u) => u.id === unitId);
        const gate = unit?.lessons[GIFT_AFTER_LESSON];
        if (!gate || !state.lessons[gate.id]?.completions) return null;

        const claimed = [...state.gifts, unitId];
        const { reward } = gift;
        if (reward.kind === "moedas") {
          set({ gifts: claimed, coins: state.coins + reward.amount });
          return { kind: "moedas", amount: reward.amount };
        }
        if (reward.kind === "faiscas") {
          const todayStr = today();
          set({
            gifts: claimed,
            xpTotal: state.xpTotal + reward.amount,
            xpByDate: {
              ...state.xpByDate,
              [todayStr]: (state.xpByDate[todayStr] ?? 0) + reward.amount,
            },
          });
          return { kind: "faiscas", amount: reward.amount };
        }
        const item = findItem(reward.itemId);
        if (!item) return null;
        if (state.ownedItems.includes(item.id)) {
          // já tinha o item: vira moedas no valor dele
          const amount = Math.max(item.price, 40);
          set({ gifts: claimed, coins: state.coins + amount });
          return { kind: "moedas", amount, insteadOf: item.name };
        }
        set({
          gifts: claimed,
          ownedItems: [...state.ownedItems, item.id],
          avatar: {
            ...state.avatar,
            equipped: { ...state.avatar.equipped, [item.slot]: item.id },
          },
        });
        return { kind: "item", itemId: item.id, name: item.name };
      },

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
        const todayStr = today();

        // bloqueios cobrem os dias perdidos antes de contar a prática de hoje
        get().syncStreak();
        get().syncLeague();
        const state = get();
        let activeDays = [...state.activeDays];
        if (!activeDays.includes(todayStr)) activeDays.push(todayStr);
        activeDays = activeDays.slice(-400);
        const streakNow = computeStreak(activeDays, state.frozenDays);

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
          bestStreak: Math.max(state.bestStreak, streakNow),
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

      finishSimulation: (id, evaluation) => {
        const todayStr = today();
        get().syncStreak();
        get().syncLeague();
        const state = get();
        const prev = state.sims[id];
        // primeira conclusão vale as faíscas cheias; repetir é treino, com recompensa menor
        const base = prev ? SIM_XP_REPEAT : SIM_XP_FIRST;
        const xp = Math.max(1, Math.round((base * evaluation.geral) / 100));
        const coins = prev ? 0 : SIM_COINS_FIRST;
        let activeDays = [...state.activeDays];
        if (!activeDays.includes(todayStr)) activeDays.push(todayStr);
        activeDays = activeDays.slice(-400);
        set({
          xpTotal: state.xpTotal + xp,
          xpByDate: { ...state.xpByDate, [todayStr]: (state.xpByDate[todayStr] ?? 0) + xp },
          coins: state.coins + coins,
          activeDays,
          bestStreak: Math.max(state.bestStreak, computeStreak(activeDays, state.frozenDays)),
          sims: {
            ...state.sims,
            [id]: {
              attempts: (prev?.attempts ?? 0) + 1,
              best: Math.max(prev?.best ?? 0, evaluation.geral),
            },
          },
          simHistory: [
            ...state.simHistory,
            {
              id,
              date: new Date().toISOString(),
              geral: evaluation.geral,
              por: evaluation.porCompetencia.map((c) => ({ id: c.id, pct: c.pct })),
            },
          ].slice(-40),
        });
        return { xp, coins };
      },

      syncStreak: () => {
        const { activeDays, frozenDays, streakFreezes } = get();
        if (streakFreezes <= 0 || activeDays.length === 0) return;
        const covered = [...activeDays, ...frozenDays];
        const last = covered.reduce((a, b) => (a > b ? a : b));
        // dias inteiros perdidos entre a última prática e hoje
        const missed = dayjs(today()).diff(dayjs(last), "day") - 1;
        if (missed <= 0 || missed > streakFreezes) return;
        const saved: string[] = [];
        for (let i = 1; i <= missed; i++) {
          saved.push(dayjs(last).add(i, "day").format("YYYY-MM-DD"));
        }
        set({
          frozenDays: [...frozenDays, ...saved].slice(-400),
          streakFreezes: streakFreezes - missed,
          freezeNotice: saved,
        });
      },

      dismissFreezeNotice: () => set({ freezeNotice: [] }),

      setAvatar: (patch) => set({ avatar: { ...get().avatar, ...patch } }),

      buyItem: (id) => {
        const item = findItem(id);
        const { coins, ownedItems, avatar } = get();
        if (!item || item.exclusive || ownedItems.includes(id) || coins < item.price) return false;
        set({
          coins: coins - item.price,
          ownedItems: [...ownedItems, id],
          // item novo já sai equipado
          avatar: { ...avatar, equipped: { ...avatar.equipped, [item.slot]: id } },
        });
        return true;
      },

      equipItem: (slot, id) => {
        const { avatar, ownedItems } = get();
        if (id && !ownedItems.includes(id)) return;
        const equipped = { ...avatar.equipped };
        if (id) equipped[slot] = id;
        else delete equipped[slot];
        set({ avatar: { ...avatar, equipped } });
      },

      syncLeague: () => {
        const { league, xpByDate, name, coins } = get();
        const currentWeek = weekKeyOf();
        if (!league.week) {
          set({ league: { ...league, week: currentWeek } });
          return;
        }
        if (league.week === currentWeek) return;

        // fecha a semana que estava em disputa
        const xp = xpOfWeek(xpByDate, league.week);
        const table = buildLeague(name, xp, league.tier, league.week, true);
        const position = table.findIndex((e) => e.isMe) + 1;
        const outcome = zoneOf(position, table.length, league.tier);
        const toTier = Math.max(
          0,
          Math.min(
            TOP_DIVISION,
            league.tier + (outcome === "subiu" ? 1 : outcome === "caiu" ? -1 : 0),
          ),
        );
        const reward = outcome === "subiu" ? PROMOTION_COINS : 0;
        set({
          coins: coins + reward,
          league: {
            tier: toTier,
            week: currentWeek,
            lastResult: {
              week: league.week,
              fromTier: league.tier,
              toTier,
              position,
              xp,
              outcome,
              coins: reward,
              seen: false,
            },
          },
        });
      },

      markLeagueResultSeen: () => {
        const { league } = get();
        if (!league.lastResult) return;
        set({ league: { ...league, lastResult: { ...league.lastResult, seen: true } } });
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
      // v4: ofensiva com bloqueio, avatar, itens e divisões.
      // v5: simulador de vendas.
      // v6: presentes da trilha.
      version: 6,
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
        if (version < 4) {
          state = {
            ...state,
            frozenDays: state.frozenDays ?? [],
            freezeNotice: [],
            bestStreak:
              state.bestStreak ?? computeStreak(state.activeDays ?? []),
            avatar: state.avatar ?? defaultAvatar,
            ownedItems: state.ownedItems ?? [],
            league: state.league ?? { tier: 0, week: "", lastResult: null },
          };
        }
        if (version < 5) {
          state = {
            ...state,
            sims: state.sims ?? {},
            simHistory: state.simHistory ?? [],
            linhaAtiva: state.linhaAtiva ?? "consultiva",
          };
        }
        if (version < 6) {
          state = { ...state, gifts: state.gifts ?? [] };
        }
        return state as FarolState;
      },
    },
  ),
);
