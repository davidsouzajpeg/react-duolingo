import type {
  CenarioQuestion,
  CompletarQuestion,
  Lesson,
  MultiplaQuestion,
  OrdenarQuestion,
  Unit,
  VerdadeiroFalsoQuestion,
} from "./types";

/**
 * Atalhos para escrever conteúdo (usados pelas linhas de treino em
 * content.ts e content-materiais.ts).
 */


export const multipla = (
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): MultiplaQuestion => ({ kind: "multipla", prompt, options, answer, explanation });

export const cenario = (
  context: string,
  customer: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
): CenarioQuestion => ({
  kind: "cenario",
  context,
  customer,
  prompt,
  options,
  answer,
  explanation,
});

export const ordenar = (
  prompt: string,
  steps: string[],
  explanation: string,
): OrdenarQuestion => ({ kind: "ordenar", prompt, steps, explanation });

export const completar = (
  sentence: string,
  answer: string[],
  distractors: string[],
  explanation: string,
): CompletarQuestion => ({
  kind: "completar",
  prompt: "Complete a frase",
  sentence,
  answer,
  distractors,
  explanation,
});

export const vf = (
  statement: string,
  answer: boolean,
  explanation: string,
): VerdadeiroFalsoQuestion => ({ kind: "vf", statement, answer, explanation });

export type UnitSeed = Omit<Unit, "lessons" | "color" | "shade"> & {
  lessons: Omit<Lesson, "kind">[];
};

