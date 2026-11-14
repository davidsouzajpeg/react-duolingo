import dayjs from "dayjs";
import { allLessons, units } from "./content";
import type { FarolStats, LessonRecord } from "./store";

/* ------------------------- Níveis (carreira consultiva) ------------------------- */

export const levels = [
  { name: "Aprendiz", minXp: 0, icon: "🌱" },
  { name: "Consultor Jr.", minXp: 100, icon: "📐" },
  { name: "Consultor", minXp: 250, icon: "🧭" },
  { name: "Consultor Sênior", minXp: 450, icon: "🤝" },
  { name: "Especialista em Fachadas", minXp: 700, icon: "🏬" },
  { name: "Mestre da Proposta", minXp: 1000, icon: "🏅" },
  { name: "Farol da Equipe", minXp: 1400, icon: "🌟" },
] as const;

export type Level = (typeof levels)[number];

export const getLevel = (xp: number) => {
  let index = 0;
  levels.forEach((level, i) => {
    if (xp >= level.minXp) index = i;
  });
  const current = levels[index]!;
  const next = levels[index + 1];
  const progress = next
    ? (xp - current.minXp) / (next.minXp - current.minXp)
    : 1;
  return { index, current, next, progress };
};

/* ------------------------------- Progresso -------------------------------- */

export type LessonStatus = "locked" | "current" | "done";

export const getLessonStatus = (
  lessonId: string,
  records: Record<string, LessonRecord>,
): LessonStatus => {
  if (records[lessonId]?.completions) return "done";
  const index = allLessons.findIndex(({ lesson }) => lesson.id === lessonId);
  if (index <= 0) return "current";
  const prevId = allLessons[index - 1]!.lesson.id;
  return records[prevId]?.completions ? "current" : "locked";
};

export const getCurrentLesson = (records: Record<string, LessonRecord>) =>
  allLessons.find(({ lesson }) => !records[lesson.id]?.completions) ?? null;

export const completedLessonCount = (records: Record<string, LessonRecord>) =>
  allLessons.filter(({ lesson }) => records[lesson.id]?.completions).length;

export const isUnitDone = (
  unitId: string,
  records: Record<string, LessonRecord>,
) =>
  units
    .find((u) => u.id === unitId)
    ?.lessons.every((l) => records[l.id]?.completions) ?? false;

/* ------------------------------ Conquistas -------------------------------- */

export type BadgeContext = {
  xpTotal: number;
  streak: number;
  stats: FarolStats;
  lessons: Record<string, LessonRecord>;
};

export type Badge = {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: (ctx: BadgeContext) => { value: number; goal: number };
};

const unitBadge = (unitNumber: number, icon: string, title: string): Badge => ({
  id: `unit-${unitNumber}`,
  icon,
  title,
  description: `Conclua a unidade ${unitNumber}: ${units[unitNumber - 1]?.title ?? ""}`,
  progress: ({ lessons }) => {
    const unit = units[unitNumber - 1]!;
    return {
      value: unit.lessons.filter((l) => lessons[l.id]?.completions).length,
      goal: unit.lessons.length,
    };
  },
});

export const badges: Badge[] = [
  {
    id: "first-lesson",
    icon: "🚀",
    title: "Primeira visita",
    description: "Conclua sua primeira lição",
    progress: ({ lessons }) => ({
      value: Math.min(1, completedLessonCount(lessons)),
      goal: 1,
    }),
  },
  {
    id: "streak-3",
    icon: "🔥",
    title: "Em ritmo",
    description: "Pratique 3 dias seguidos",
    progress: ({ streak }) => ({ value: Math.min(streak, 3), goal: 3 }),
  },
  {
    id: "streak-7",
    icon: "📆",
    title: "Follow-up em dia",
    description: "Pratique 7 dias seguidos",
    progress: ({ streak }) => ({ value: Math.min(streak, 7), goal: 7 }),
  },
  {
    id: "perfect-3",
    icon: "💎",
    title: "Farol verde",
    description: "Faça 3 lições sem errar nenhuma questão",
    progress: ({ stats }) => ({
      value: Math.min(stats.perfectLessons, 3),
      goal: 3,
    }),
  },
  {
    id: "combo-8",
    icon: "⚡",
    title: "Feixe aceso",
    description: "Acerte 8 questões seguidas em uma lição",
    progress: ({ stats }) => ({ value: Math.min(stats.bestCombo, 8), goal: 8 }),
  },
  {
    id: "xp-500",
    icon: "🏆",
    title: "Meta batida",
    description: "Acumule 500 XP",
    progress: ({ xpTotal }) => ({ value: Math.min(xpTotal, 500), goal: 500 }),
  },
  unitBadge(1, "💡", "Cultura Open"),
  unitBadge(2, "🔎", "Lição de casa feita"),
  unitBadge(3, "🎤", "Venda inteligente"),
  unitBadge(4, "🧩", "Diagnóstico certeiro"),
  unitBadge(5, "📈", "Solução ampliada"),
  unitBadge(6, "🛡️", "Quebrador de objeções"),
  unitBadge(7, "✍️", "Aceite formal"),
  unitBadge(8, "🤝", "Embaixador da Open"),
];

export const isBadgeUnlocked = (badge: Badge, ctx: BadgeContext) => {
  const { value, goal } = badge.progress(ctx);
  return value >= goal;
};

/* -------------------------------- Ranking --------------------------------- */

const colleagues = [
  "Ana Paula",
  "Bruno Lima",
  "Camila Rocha",
  "Diego Martins",
  "Fernanda Alves",
  "Gustavo Reis",
  "Juliana Costa",
  "Marcos Vieira",
  "Patrícia Nunes",
  "Rafael Souza",
  "Tatiane Melo",
];

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export type LeagueEntry = {
  name: string;
  xp: number;
  isMe: boolean;
};

/**
 * Liga semanal com colegas simulados. Os pontos deles crescem ao longo da
 * semana de forma determinística, para o ranking parecer vivo.
 * Substitua por dados reais do time quando houver backend.
 */
export const buildLeague = (myName: string, myWeekXp: number): LeagueEntry[] => {
  const now = dayjs();
  const weekKey = now.startOf("week").format("YYYY-MM-DD");
  const daysSinceMonday = ((now.day() + 6) % 7) + now.hour() / 24;
  const weekProgress = Math.min(1, (daysSinceMonday + 0.5) / 7);

  const others = colleagues.map((name) => {
    const seed = hash(name + weekKey);
    const potential = 60 + (seed % 340);
    return {
      name,
      xp: Math.round(potential * weekProgress),
      isMe: false,
    };
  });

  return [...others, { name: myName || "Você", xp: myWeekXp, isMe: true }].sort(
    (a, b) => b.xp - a.xp || (a.isMe ? -1 : b.isMe ? 1 : 0),
  );
};

export const PROMOTION_SPOTS = 3;
