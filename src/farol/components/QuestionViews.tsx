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

export type AnswerValue = number | boolean | number[] | (number | null)[] | null;

export type QuestionInstance = {
  key: number;
  question: Question;
  /** ordem embaralhada de exibição (opções, passos ou banco de palavras) */
  order: number[];
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
export const makeInstance = (question: Question): QuestionInstance => {
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
  return { key: instanceKey++, question, order };
};

export const initialAnswer = (q: Question): AnswerValue => {
  if (q.kind === "ordenar") return [];
  if (q.kind === "completar") return Array<null>(blankCount(q)).fill(null);
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
      return Array.isArray(a) && a.length === q.steps.length;
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
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1 className="mb-6 text-2xl font-extrabold text-[#0f2742] sm:text-3xl">
    {children}
  </h1>
);

const optionStyle = (state: "idle" | "selected" | "right" | "wrong") =>
  ({
    idle: "border-gray-200 hover:bg-gray-50",
    selected: "border-sky-400 bg-sky-50 text-sky-700",
    right: "border-green-500 bg-green-50 text-green-700",
    wrong: "border-rose-400 bg-rose-50 text-rose-600",
  })[state];

const OptionList = ({
  options,
  order,
  value,
  answer,
  onChange,
  revealed,
}: {
  options: string[];
  order: number[];
  value: AnswerValue;
  answer: number;
  onChange: (v: AnswerValue) => void;
  revealed: boolean;
}) => (
  <div className="flex flex-col gap-3" role="radiogroup">
    {order.map((optionIndex, position) => {
      const selected = value === optionIndex;
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
          disabled={revealed}
          onClick={() => onChange(optionIndex)}
          className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 p-4 text-left transition active:translate-y-0.5 disabled:active:translate-y-0 ${optionStyle(state)}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-current text-sm font-bold opacity-60">
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
    <OptionList {...props} options={props.question.options} answer={props.question.answer} />
  </>
);

const CenarioView = (props: ViewProps<CenarioQuestion>) => {
  const { question } = props;
  return (
    <>
      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-rose-500">
        Situação real
      </p>
      {question.context && <p className="mb-4 text-gray-500">{question.context}</p>}
      <div className="mb-6 flex items-end gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0f2742] text-3xl"
          aria-hidden
        >
          🧑‍💼
        </div>
        <div className="relative rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg">
          <span className="sr-only">O cliente diz: </span>“{question.customer}”
          <div className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-gray-200 bg-white" />
        </div>
      </div>
      <h1 className="mb-4 text-xl font-extrabold text-[#0f2742]">{question.prompt}</h1>
      <OptionList {...props} options={question.options} answer={question.answer} />
    </>
  );
};

const VfView = ({ question, value, onChange, revealed }: ViewProps<VerdadeiroFalsoQuestion>) => (
  <>
    <Title>Verdadeiro ou falso?</Title>
    <blockquote className="mb-6 rounded-2xl border-2 border-gray-200 bg-gray-50 p-5 text-lg sm:text-xl">
      {question.statement}
    </blockquote>
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((option, i) => {
        const selected = value === option;
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
            disabled={revealed}
            onClick={() => onChange(option)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 border-b-4 p-5 text-lg font-bold transition active:translate-y-0.5 ${optionStyle(state)}`}
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
    className={`rounded-xl border-2 border-b-4 px-3 py-2 text-left text-base transition active:translate-y-0.5 ${
      hidden
        ? "border-gray-200 bg-gray-200 text-transparent"
        : tone === "right"
          ? "border-green-500 bg-green-50 text-green-700"
          : tone === "wrong"
            ? "border-rose-400 bg-rose-50 text-rose-600"
            : "border-gray-200 bg-white hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const OrdenarView = ({ question, order, value, onChange, revealed }: ViewProps<OrdenarQuestion>) => {
  const picked = (value as number[]) ?? [];
  return (
    <>
      <Title>{question.prompt}</Title>
      <p className="-mt-4 mb-4 text-gray-500">Toque nos itens na ordem certa.</p>
      <ol className="mb-6 flex min-h-[120px] flex-col gap-2 rounded-2xl border-2 border-dashed border-gray-300 p-3">
        {picked.length === 0 && (
          <li className="m-auto text-gray-400">Sua sequência aparece aqui</li>
        )}
        {picked.map((stepIndex, position) => (
          <li key={stepIndex} className="flex items-center gap-2">
            <span className="w-6 text-right font-bold text-gray-400">{position + 1}.</span>
            <Chip
              disabled={revealed}
              tone={revealed ? (stepIndex === position ? "right" : "wrong") : "idle"}
              onClick={() => onChange(picked.filter((p) => p !== stepIndex))}
            >
              {question.steps[stepIndex]}
            </Chip>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {order.map((stepIndex) => (
          <Chip
            key={stepIndex}
            hidden={picked.includes(stepIndex)}
            disabled={revealed}
            onClick={() => onChange([...picked, stepIndex])}
          >
            {question.steps[stepIndex]}
          </Chip>
        ))}
      </div>
    </>
  );
};

const CompletarView = ({ question, order, value, onChange, revealed }: ViewProps<CompletarQuestion>) => {
  const filled = (value as (number | null)[]) ?? [];
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
      <p className="mb-8 rounded-2xl border-2 border-gray-200 p-5 text-lg leading-[2.6rem] sm:text-xl">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 &&
              (filled[i] !== null && filled[i] !== undefined ? (
                <button
                  disabled={revealed}
                  onClick={() => remove(i)}
                  className={`mx-1 rounded-lg border-2 border-b-4 px-2 py-0.5 font-bold ${
                    revealed
                      ? bank[filled[i]] === question.answer[i]
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-rose-400 bg-rose-50 text-rose-600"
                      : "border-sky-300 bg-sky-50 text-sky-700"
                  }`}
                >
                  {bank[filled[i]]}
                </button>
              ) : (
                <span className="mx-1 inline-block w-24 border-b-2 border-gray-400 align-baseline" aria-label="lacuna" />
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
