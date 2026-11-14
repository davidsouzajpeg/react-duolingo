import type { ReactNode } from "react";
import type {
  CenarioQuestion,
  CompletarQuestion,
  MultiplaQuestion,
  OrdenarQuestion,
  Question,
  VerdadeiroFalsoQuestion,
} from "../types";

/* ------------------------------ Tipos/lógica ------------------------------ */

export type AnswerValue =
  | number
  | boolean
  | number[]
  | (number | null)[]
  | null;

/**
 * Ajuda nas repetições: depois de errar a mesma questão mais de uma vez, o que
 * o vendedor já acertou fica marcado e ele completa só o que falta.
 */
export type Help = {
  /** ordenar: posições já acertadas (o passo certo fica fixo nelas) */
  lockedSteps?: number[];
  /** completar: lacunas já acertadas */
  lockedBlanks?: number[];
  /** múltipla escolha e situação: opções já tentadas, que estavam erradas */
  eliminated?: number[];
  /** verdadeiro ou falso: resposta já tentada, que estava errada */
  eliminatedVf?: boolean;
};

export type QuestionInstance = {
  key: number;
  question: Question;
  /** ordem embaralhada de exibição (opções, passos ou banco de palavras) */
  order: number[];
  help?: Help;
};

/** junta a ajuda anterior com o que a última resposta (errada) acertou */
export const mergeHelp = (
  q: Question,
  a: AnswerValue,
  prev: Help = {},
): Help => {
  const union = (x: number[] = [], y: number[]) => [...new Set([...x, ...y])];
  switch (q.kind) {
    case "multipla":
    case "cenario":
      return typeof a === "number"
        ? { eliminated: union(prev.eliminated, [a]) }
        : prev;
    case "vf":
      return typeof a === "boolean" ? { eliminatedVf: a } : prev;
    case "ordenar": {
      const slots = Array.isArray(a) ? a : [];
      const right = slots.flatMap((v, i) => (v === i ? [i] : []));
      return { lockedSteps: union(prev.lockedSteps, right) };
    }
    case "completar": {
      const bank = completarBank(q);
      const slots = Array.isArray(a) ? a : [];
      const right = slots.flatMap((v, i) =>
        v !== null && v !== undefined && bank[v] === q.answer[i] ? [i] : [],
      );
      return { lockedBlanks: union(prev.lockedBlanks, right) };
    }
  }
};

export const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const indices = (n: number) => Array.from({ length: n }, (_, i) => i);

export const completarBank = (q: CompletarQuestion) => [
  ...q.answer,
  ...q.distractors,
];

const blankCount = (q: CompletarQuestion) => q.sentence.split("___").length - 1;

let instanceKey = 0;
export const makeInstance = (
  question: Question,
  help?: Help,
): QuestionInstance => {
  let order: number[] = [];
  switch (question.kind) {
    case "multipla":
    case "cenario":
      order = shuffle(indices(question.options.length));
      break;
    case "ordenar": {
      const identity = indices(question.steps.length);
      do {
        order = shuffle(identity);
      } while (order.every((v, i) => v === i) && identity.length > 1);
      break;
    }
    case "completar":
      order = shuffle(indices(completarBank(question).length));
      break;
    case "vf":
      break;
  }
  return { key: instanceKey++, question, order, help };
};

export const initialAnswer = (q: Question, help?: Help): AnswerValue => {
  if (q.kind === "ordenar") {
    // uma casa por posição; as já acertadas voltam preenchidas
    return q.steps.map((_, i) => (help?.lockedSteps?.includes(i) ? i : null));
  }
  if (q.kind === "completar") {
    // as respostas certas ocupam os primeiros índices do banco de palavras
    return Array.from({ length: blankCount(q) }, (_, i) =>
      help?.lockedBlanks?.includes(i) ? i : null,
    );
  }
  return null;
};

export const canCheck = (q: Question, a: AnswerValue) => {
  switch (q.kind) {
    case "multipla":
    case "cenario":
      return typeof a === "number";
    case "vf":
      return typeof a === "boolean";
    case "ordenar":
      return (
        Array.isArray(a) &&
        a.length === q.steps.length &&
        a.every((v) => v !== null)
      );
    case "completar":
      return Array.isArray(a) && a.every((v) => v !== null);
  }
};

export const isCorrect = (q: Question, a: AnswerValue) => {
  switch (q.kind) {
    case "multipla":
    case "cenario":
    case "vf":
      return a === q.answer;
    case "ordenar":
      return Array.isArray(a) && a.every((v, i) => v === i);
    case "completar": {
      const bank = completarBank(q);
      return (
        Array.isArray(a) &&
        a.every((v, i) => v !== null && bank[v] === q.answer[i])
      );
    }
  }
};

export const correctAnswerText = (q: Question) => {
  switch (q.kind) {
    case "multipla":
    case "cenario":
      return q.options[q.answer]!;
    case "vf":
      return q.answer ? "Verdadeiro" : "Falso";
    case "ordenar":
      return q.steps.map((s, i) => `${i + 1}. ${s}`).join("  ·  ");
    case "completar": {
      let i = 0;
      return q.sentence.replace(/___/g, () => q.answer[i++] ?? "");
    }
  }
};

/* ---------------------------------- Views --------------------------------- */

type ViewProps<Q extends Question> = {
  question: Q;
  order: number[];
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  /** depois de verificar: trava a interação e mostra o resultado */
  revealed: boolean;
  help?: Help;
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1 className="mb-6 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
    {children}
  </h1>
);

const optionStyle = (state: "idle" | "selected" | "right" | "wrong") =>
  ({
    idle: "border-farol-line bg-farol-surface hover:bg-farol-surface2",
    selected: "border-farol-accent bg-farol-accent-soft text-farol-ink",
    right: "border-farol-ok bg-farol-ok-soft text-farol-ok",
    wrong: "border-farol-bad bg-farol-bad-soft text-farol-bad",
  })[state];

const OptionList = ({
  options,
  order,
  value,
  answer,
  onChange,
  revealed,
  help,
}: {
  options: string[];
  order: number[];
  value: AnswerValue;
  answer: number;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
  help?: Help;
}) => (
  <div className="flex flex-col gap-3" role="radiogroup">
    {order.map((optionIndex, position) => {
      const selected = value === optionIndex;
      // opção que o vendedor já tentou e estava errada: sai do caminho
      const out = !revealed && !!help?.eliminated?.includes(optionIndex);
      const state = revealed
        ? optionIndex === answer
          ? "right"
          : selected
            ? "wrong"
            : "idle"
        : selected
          ? "selected"
          : "idle";
      return (
        <button
          key={optionIndex}
          role="radio"
          aria-checked={selected}
          disabled={revealed || out}
          aria-label={out ? `${options[optionIndex]} (já tentada)` : undefined}
          onClick={() => onChange(optionIndex)}
          className={`flex items-center gap-3 rounded-2xl border border-b-4 p-4 text-left transition active:translate-y-0.5 disabled:active:translate-y-0 ${optionStyle(state)} ${out ? "line-through opacity-35" : ""}`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-num text-sm font-extrabold ${state === "selected" ? "border-farol-accent bg-farol-accent text-white" : "border-current opacity-60"}`}
          >
            {position + 1}
          </span>
          <span className="text-base sm:text-lg">{options[optionIndex]}</span>
        </button>
      );
    })}
  </div>
);

const MultiplaView = (props: ViewProps<MultiplaQuestion>) => (
  <>
    <Title>{props.question.prompt}</Title>
    <OptionList
      {...props}
      options={props.question.options}
      answer={props.question.answer}
    />
  </>
);

const CenarioView = (props: ViewProps<CenarioQuestion>) => {
  const { question } = props;
  return (
    <>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[.09em] text-farol-accent">
        Situação real
      </p>
      {question.context && (
        <p className="mb-4 text-farol-muted">{question.context}</p>
      )}
      <div className="mb-6 flex items-end gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-farol-line bg-farol-lamp text-2xl sm:h-16 sm:w-16 sm:text-3xl"
          aria-hidden
        >
          🧑‍💼
        </div>
        <div className="relative rounded-2xl bg-farol-papel px-4 py-3 text-base font-medium text-farol-bg sm:text-lg">
          <span className="sr-only">O cliente diz: </span>“{question.customer}”
          <div className="absolute -left-[6px] bottom-4 h-4 w-4 rotate-45 bg-farol-papel" />
        </div>
      </div>
      <h1 className="mb-4 font-display text-xl font-extrabold tracking-tight">
        {question.prompt}
      </h1>
      <OptionList
        {...props}
        options={question.options}
        answer={question.answer}
      />
    </>
  );
};

const VfView = ({
  question,
  value,
  onChange,
  revealed,
  help,
}: ViewProps<VerdadeiroFalsoQuestion>) => (
  <>
    <Title>Verdadeiro ou falso?</Title>
    <blockquote className="mb-6 rounded-2xl border border-l-4 border-farol-line border-l-farol-accent bg-farol-surface p-5 text-lg sm:text-xl">
      {question.statement}
    </blockquote>
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((option, i) => {
        const selected = value === option;
        const out = !revealed && help?.eliminatedVf === option;
        const state = revealed
          ? option === question.answer
            ? "right"
            : selected
              ? "wrong"
              : "idle"
          : selected
            ? "selected"
            : "idle";
        return (
          <button
            key={String(option)}
            disabled={revealed || out}
            onClick={() => onChange(option)}
            className={`flex flex-col items-center gap-1 rounded-2xl border border-b-4 p-5 text-lg font-semibold transition active:translate-y-0.5 ${optionStyle(state)} ${out ? "line-through opacity-35" : ""}`}
          >
            <span className="text-3xl" aria-hidden>
              {option ? "👍" : "👎"}
            </span>
            {option ? "Verdadeiro" : "Falso"}
            <span className="sr-only">(tecla {i + 1})</span>
          </button>
        );
      })}
    </div>
  </>
);

const Chip = ({
  children,
  onClick,
  disabled,
  hidden,
  tone = "idle",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  tone?: "idle" | "right" | "wrong";
}) => (
  <button
    onClick={onClick}
    disabled={disabled || hidden}
    className={`rounded-xl border border-b-4 px-3 py-2 text-left text-base transition active:translate-y-0.5 ${
      hidden
        ? "border-farol-surface2 bg-farol-surface2 text-transparent"
        : tone === "right"
          ? "border-farol-ok bg-farol-ok-soft text-farol-ok"
          : tone === "wrong"
            ? "border-farol-bad bg-farol-bad-soft text-farol-bad"
            : "border-farol-line bg-farol-surface hover:bg-farol-surface2"
    }`}
  >
    {children}
  </button>
);

const OrdenarView = ({
  question,
  order,
  value,
  onChange,
  revealed,
  help,
}: ViewProps<OrdenarQuestion>) => {
  // uma casa por posição; null = ainda vazia
  const slots = Array.isArray(value)
    ? (value as (number | null)[])
    : question.steps.map(() => null);
  const locked = help?.lockedSteps ?? [];
  const place = (stepIndex: number) => {
    const slot = slots.indexOf(null);
    if (slot === -1) return;
    const next = [...slots];
    next[slot] = stepIndex;
    onChange(next);
  };
  const clear = (position: number) => {
    const next = [...slots];
    next[position] = null;
    onChange(next);
  };
  return (
    <>
      <Title>{question.prompt}</Title>
      <p className="-mt-4 mb-4 text-farol-muted">
        {locked.length > 0
          ? "O que você já acertou ficou no lugar. Complete as posições vazias."
          : "Toque nos itens na ordem certa."}
      </p>
      <ol className="mb-6 flex flex-col gap-2 rounded-2xl border border-dashed border-farol-line bg-farol-lamp/40 p-3">
        {slots.map((stepIndex, position) => {
          const isLocked = locked.includes(position);
          return (
            <li key={position} className="flex min-h-[46px] items-center gap-2">
              <span className="w-6 shrink-0 text-right font-num font-extrabold text-farol-muted">
                {position + 1}.
              </span>
              {stepIndex === null ? (
                <span
                  className="h-10 grow rounded-xl border border-dashed border-farol-line"
                  aria-label="posição vazia"
                />
              ) : (
                <Chip
                  disabled={revealed || isLocked}
                  tone={
                    isLocked || (revealed && stepIndex === position)
                      ? "right"
                      : revealed
                        ? "wrong"
                        : "idle"
                  }
                  onClick={() => clear(position)}
                >
                  {isLocked && <span aria-hidden>✓ </span>}
                  {question.steps[stepIndex]}
                </Chip>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        {order
          // passos já acertados estão fixos lá em cima: não aparecem de novo aqui
          .filter((stepIndex) => !locked.includes(stepIndex))
          .map((stepIndex) => (
            <Chip
              key={stepIndex}
              hidden={slots.includes(stepIndex)}
              disabled={revealed}
              onClick={() => place(stepIndex)}
            >
              {question.steps[stepIndex]}
            </Chip>
          ))}
      </div>
    </>
  );
};

const CompletarView = ({
  question,
  order,
  value,
  onChange,
  revealed,
  help,
}: ViewProps<CompletarQuestion>) => {
  const filled = (value as (number | null)[]) ?? [];
  const lockedBlanks = help?.lockedBlanks ?? [];
  const bank = completarBank(question);
  const parts = question.sentence.split("___");

  const place = (bankIndex: number) => {
    const slot = filled.indexOf(null);
    if (slot === -1) return;
    const next = [...filled];
    next[slot] = bankIndex;
    onChange(next);
  };
  const remove = (slot: number) => {
    const next = [...filled];
    next[slot] = null;
    onChange(next);
  };

  return (
    <>
      <Title>{question.prompt}</Title>
      <p className="mb-8 rounded-2xl border border-farol-line bg-farol-surface p-5 text-lg leading-[2.6rem] sm:text-xl">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 &&
              (filled[i] !== null && filled[i] !== undefined ? (
                <button
                  disabled={revealed || lockedBlanks.includes(i)}
                  onClick={() => remove(i)}
                  className={`mx-1 rounded-lg border border-b-4 px-2 py-0.5 font-semibold ${
                    revealed || lockedBlanks.includes(i)
                      ? bank[filled[i]] === question.answer[i]
                        ? "border-farol-ok bg-farol-ok-soft text-farol-ok"
                        : "border-farol-bad bg-farol-bad-soft text-farol-bad"
                      : "border-farol-accent bg-farol-accent-soft text-farol-ink"
                  }`}
                >
                  {bank[filled[i]]}
                </button>
              ) : (
                <span
                  className="mx-1 inline-block w-24 border-b-2 border-farol-muted align-baseline"
                  aria-label="lacuna"
                />
              ))}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {order.map((bankIndex) => (
          <Chip
            key={bankIndex}
            hidden={filled.includes(bankIndex)}
            disabled={revealed}
            onClick={() => place(bankIndex)}
          >
            {bank[bankIndex]}
          </Chip>
        ))}
      </div>
    </>
  );
};

export const QuestionView = (props: ViewProps<Question>) => {
  const q = props.question;
  switch (q.kind) {
    case "multipla":
      return <MultiplaView {...props} question={q} />;
    case "cenario":
      return <CenarioView {...props} question={q} />;
    case "vf":
      return <VfView {...props} question={q} />;
    case "ordenar":
      return <OrdenarView {...props} question={q} />;
    case "completar":
      return <CompletarView {...props} question={q} />;
  }
};
