import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { findLesson, lessonListOf } from "~/farol/content";
import {
  CloseIcon,
  CoinIcon,
  FlameIcon,
  XpIcon,
} from "~/farol/components/Icons";
import {
  type AnswerValue,
  type Help,
  type QuestionInstance,
  QuestionView,
  canCheck,
  correctAnswerText,
  initialAnswer,
  isCorrect,
  makeInstance,
  mergeHelp,
  shuffle,
} from "~/farol/components/QuestionViews";
import {
  Button,
  Eyebrow,
  FarolShell,
  Faroldo,
  Feixe,
  Pill,
  ProgressBar,
  Semaforo,
  buttonBase,
  buttonVariants,
  card,
  sinalDaPrecisao,
  sinalInfo,
  type Sinal,
} from "~/farol/components/ui";
import {
  badges,
  getLessonStatus,
  getLevel,
  isBadgeUnlocked,
  type Badge,
  type BadgeContext,
} from "~/farol/gamification";
import { Avatar } from "~/farol/components/Avatar";
import { Confetti, CountUp } from "~/farol/components/Celebrate";
import { useHydrated, useSounds } from "~/farol/hooks";
import { notifyGestorTrailCompleted } from "~/farol/notify";
import { Parabens } from "~/farol/components/TrailEnd";
import {
  computeStreak,
  isTrailComplete,
  useFarolStore,
} from "~/farol/store";
import type { Lesson } from "~/farol/types";

/** a partir de quantos erros na mesma questão o que já foi acertado fica marcado (1 = já na primeira correção) */
const HELP_AFTER_ERRORS = 1;

const praise = [
  "Boa!",
  "Mandou bem!",
  "Isso aí!",
  "Boa escolha!",
  "Na medida!",
  "É assim que se valoriza a solução!",
];

const badgeContext = (): BadgeContext => {
  const s = useFarolStore.getState();
  return {
    xpTotal: s.xpTotal,
    streak: computeStreak(s.activeDays, s.frozenDays),
    stats: s.stats,
    lessons: s.lessons,
  };
};

type Summary = {
  xp: number;
  coins: number;
  accuracy: number;
  seconds: number;
  bestCombo: number;
  streakBefore: number;
  streakAfter: number;
  levelUp: string | null;
  newBadges: Badge[];
  /** esta lição fechou a trilha inteira */
  trailJustCompleted: boolean;
};

/* ------------------------------ Player ------------------------------------ */

const LessonPlayer = ({ lesson, onRestart }: { lesson: Lesson; onRestart: () => void }) => {
  const finishLesson = useFarolStore((s) => s.finishLesson);
  const sounds = useSounds();

  const total = lesson.questions.length;
  const isChallenge = lesson.kind === "desafio";

  const [queue, setQueue] = useState<QuestionInstance[]>(() =>
    shuffle(lesson.questions).map((q) => makeInstance(q)),
  );
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue>(() =>
    initialAnswer(queue[0]!.question),
  );
  const [status, setStatus] = useState<"answering" | "right" | "wrong">(
    "answering",
  );
  const [solved, setSolved] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [comboXp, setComboXp] = useState(0);
  const [praiseText, setPraiseText] = useState(praise[0]!);
  const [quitOpen, setQuitOpen] = useState(false);
  // a lição abre com a dica do Faroldo: primeiro aprende, depois pratica
  const [started, setStarted] = useState(!lesson.tip);
  const start = () => {
    sounds.whoosh();
    startedAt.current = Date.now();
    setStarted(true);
  };
  const [summary, setSummary] = useState<Summary | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  // pausa antes da rodada de correção e etapa da chama antes do resumo
  const [reviewIntro, setReviewIntro] = useState(false);
  const [chamaSeen, setChamaSeen] = useState(false);
  const [gain, setGain] = useState(0);
  const startedAt = useRef(Date.now());
  // erros e acertos parciais por questão (para a ajuda nas repetições)
  const errorCount = useRef<Record<string, number>>({});
  const helps = useRef<Record<string, Help>>({});

  const current = queue[pos]!;
  const questionId = (inst: QuestionInstance) =>
    String(lesson.questions.indexOf(inst.question));

  const check = useCallback(() => {
    if (status !== "answering" || !canCheck(current.question, answer)) return;
    setAnswered((n) => n + 1);
    if (isCorrect(current.question, answer)) {
      sounds.correct(combo + 1);
      setStatus("right");
      setSolved((n) => n + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      if (nextCombo >= 3) setComboXp((x) => x + 1);
      // faíscas só contam para o que foi acertado de primeira
      setGain(
        missed.has(questionId(current))
          ? 0
          : (2 + (nextCombo >= 3 ? 1 : 0)) * (isChallenge ? 2 : 1),
      );
      setPraiseText(
        nextCombo >= 3
          ? `${nextCombo} seguidas! 🔥`
          : praise[Math.floor(Math.random() * praise.length)]!,
      );
    } else {
      sounds.wrong();
      setStatus("wrong");
      setCombo(0);
      const qid = questionId(current);
      setMissed((m) => new Set(m).add(qid));
      // a questão volta no fim da fila, já com o que foi acertado marcado (ver Help)
      const errors = (errorCount.current[qid] ?? 0) + 1;
      errorCount.current[qid] = errors;
      const help = mergeHelp(current.question, answer, helps.current[qid]);
      helps.current[qid] = help;
      setQueue((q) => [
        ...q,
        makeInstance(current.question, errors >= HELP_AFTER_ERRORS ? help : undefined),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, current, answer, combo, missed]);

  const finish = useCallback(() => {
    const firstTry = total - missed.size;
    const accuracy = firstTry / total;
    const perfect = missed.size === 0;
    const multiplier = isChallenge ? 2 : 1;
    const xp = (firstTry * 2 + 5 + (perfect ? 5 : 0) + comboXp) * multiplier;
    const coins = 5 + (perfect ? 5 : 0) + (isChallenge ? 10 : 0);

    const before = useFarolStore.getState();
    const ctxBefore = badgeContext();
    const levelBefore = getLevel(before.xpTotal).index;

    finishLesson({
      lessonId: lesson.id,
      isChallenge,
      xp,
      coins,
      accuracy,
      answered,
      correct: solved,
      bestCombo,
    });

    const after = useFarolStore.getState();
    const ctxAfter = badgeContext();
    const levelAfter = getLevel(after.xpTotal);
    const trailJustCompleted =
      !isTrailComplete(before.lessons) && isTrailComplete(after.lessons);
    // finishLesson já deixou o aviso "pendente"; tenta enviar agora
    if (trailJustCompleted) void notifyGestorTrailCompleted();

    const leveledUp = levelAfter.index > levelBefore;
    if (ctxAfter.streak > ctxBefore.streak) {
      // primeiro a chama acende; a fanfarra do resultado fica para o resumo
      setTimeout(() => sounds.ignite(), 450);
    } else {
      sounds.finish(sinalDaPrecisao(accuracy));
      if (leveledUp) setTimeout(() => sounds.levelUp(), 2300);
    }
    window.scrollTo(0, 0);
    setSummary({
      xp,
      coins,
      accuracy,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      bestCombo,
      streakBefore: ctxBefore.streak,
      streakAfter: ctxAfter.streak,
      levelUp: levelAfter.index > levelBefore ? levelAfter.current.name : null,
      newBadges: badges.filter(
        (b) => !isBadgeUnlocked(b, ctxBefore) && isBadgeUnlocked(b, ctxAfter),
      ),
      trailJustCompleted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missed, comboXp, answered, solved, bestCombo]);

  const next = useCallback(() => {
    if (status === "answering") return;
    if (solved >= total) return finish();
    const nextPos = pos + 1;
    // a próxima questão começa do topo, mesmo que a anterior tenha sido rolada
    window.scrollTo(0, 0);
    setPos(nextPos);
    setAnswer(initialAnswer(queue[nextPos]!.question, queue[nextPos]!.help));
    setStatus("answering");
    // acabou a primeira passada: avisa que agora é a rodada de correção
    if (nextPos === total) {
      sounds.whoosh();
      setReviewIntro(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, solved, total, finish, pos, queue]);

  const closeChama = () => {
    if (!summary) return;
    setChamaSeen(true);
    window.scrollTo(0, 0);
    sounds.finish(sinalDaPrecisao(summary.accuracy));
    if (summary.levelUp) setTimeout(() => sounds.levelUp(), 2300);
  };
  const showChama =
    !!summary && !chamaSeen && summary.streakAfter > summary.streakBefore;

  // Atalhos de teclado: Enter verifica/continua; 1–4 escolhem opções
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showChama) {
        if (e.key === "Enter") {
          e.preventDefault();
          closeChama();
        }
        return;
      }
      if (summary || quitOpen) return;
      if (reviewIntro) {
        if (e.key === "Enter") {
          e.preventDefault();
          setReviewIntro(false);
        }
        return;
      }
      if (!started) {
        if (e.key === "Enter") {
          e.preventDefault();
          startedAt.current = Date.now();
          setStarted(true);
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "answering") check();
        else next();
        return;
      }
      if (status !== "answering") return;
      const n = Number(e.key);
      const q = current.question;
      if ((q.kind === "multipla" || q.kind === "cenario") && current.order[n - 1] !== undefined) {
        const option = current.order[n - 1]!;
        if (!current.help?.eliminated?.includes(option)) setAnswer(option);
      } else if (q.kind === "vf" && (n === 1 || n === 2)) {
        if (current.help?.eliminatedVf !== (n === 1)) setAnswer(n === 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, check, next, current, summary, quitOpen, started, reviewIntro, showChama]);

  if (summary && celebrating) return <Parabens />;

  if (!started) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:py-10">
        <Link href="/farol" aria-label="Voltar à trilha" className="self-start text-farol-muted hover:text-farol-ink">
          <CloseIcon className="h-7 w-7" />
        </Link>
        <div className="vd-stagger flex grow flex-col justify-center gap-5">
          <div>
            <Eyebrow className="text-farol-accent">
              {isChallenge ? "Desafio da unidade" : "Antes de praticar"}
            </Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {lesson.title}
            </h1>
          </div>
          <div className={`${card} flex items-start gap-3 p-5`}>
            <Faroldo className="vd-hop h-14 w-14" mood="feliz" />
            <div className="min-w-0">
              <Eyebrow className="text-farol-accent">Dica do Faroldo</Eyebrow>
              <p className="mt-1 text-lg leading-snug">{lesson.tip}</p>
            </div>
          </div>
          <p className="text-sm text-farol-muted">
            Agora é praticar em {total} situações. Errou? Sem problema: a explicação
            mostra o caminho e a situação volta para você tentar de novo.
          </p>
        </div>
        <Button className="mt-8 w-full" onClick={start} autoFocus>
          Bora praticar
        </Button>
      </div>
    );
  }

  if (summary && showChama) {
    return <ChamaStep before={summary.streakBefore} after={summary.streakAfter} onContinue={closeChama} />;
  }

  if (reviewIntro) {
    const pending = queue.length - pos;
    return (
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden px-4 py-8 sm:py-10">
        <div aria-hidden className="vd-aura vd-aura-ouro left-[-25%] top-[18%] h-72 w-72" />
        <div aria-hidden className="vd-aura vd-aura-rosa right-[-30%] top-[42%] h-72 w-72" />
        <div className="vd-stagger relative flex grow flex-col items-center justify-center gap-5 text-center">
          <Faroldo className="vd-hop h-24 w-24" mood="atento" />
          <div>
            <Eyebrow className="text-farol-warn">Rodada de correção</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight">
              {pending === 1 ? "Falta só uma situação" : `Faltam ${pending} situações`}
            </h1>
          </div>
          <p className="max-w-sm text-farol-muted">
            Vamos rever o que escapou. O que você já acertou fica marcado: é só
            completar o que falta.
          </p>
        </div>
        <footer className="relative mt-8">
          <Button className="w-full" onClick={() => setReviewIntro(false)} autoFocus>
            Continuar
          </Button>
        </footer>
      </div>
    );
  }

  if (summary) {
    return (
      <LessonSummary
        summary={summary}
        lesson={lesson}
        onRestart={onRestart}
        onCelebrate={
          summary.trailJustCompleted ? () => setCelebrating(true) : undefined
        }
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-6 sm:pt-10">
        <button
          onClick={() => setQuitOpen(true)}
          className="text-farol-muted hover:text-farol-ink"
          aria-label="Sair da lição"
        >
          <CloseIcon className="h-7 w-7" />
        </button>
        <div className="relative grow">
          <div key={solved} className={solved > 0 ? "vd-glow" : ""}>
            {/* em sequência de acertos a barra vira ouro */}
            <ProgressBar value={solved / total} className="h-4" color={combo >= 3 ? "#f5b331" : "#ff0084"} />
          </div>
          {combo >= 3 && (
            <span key={combo} className="vd-combo absolute -top-7 right-0 flex items-center gap-1 rounded-full px-2.5 py-0.5 font-num text-xs font-black uppercase tracking-wider text-farol-lamp">
              <FlameIcon className="h-3.5 w-3.5" /> Combo x{combo}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl grow px-4 pb-64 pt-8 sm:pt-14">
        {isChallenge && pos === 0 && status === "answering" && (
          <Pill tone="amarelo" className="mb-3 uppercase tracking-[.09em]">
            🏆 Desafio · faíscas em dobro
          </Pill>
        )}
        {missed.has(questionId(current)) && status === "answering" && pos >= total && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.09em] text-farol-warn">
            {current.help
              ? "↻ Deixei marcado o que você já acertou. Complete só o que falta"
              : "↻ Mais uma chance nesta situação"}
          </p>
        )}
        <div key={current.key} className={`vd-in ${status === "wrong" ? "vd-shake" : ""}`}>
          <QuestionView
            question={current.question}
            order={current.order}
            value={answer}
            onChange={(value) => {
              sounds.tap();
              setAnswer(value);
            }}
            revealed={status !== "answering"}
            help={current.help}
          />
        </div>
      </main>

      {status === "right" && (
        <div key={`burst-${current.key}`} className="pointer-events-none fixed bottom-40 left-0 right-0 z-20">
          <div className="relative mx-auto h-0 w-0">
            <Confetti kind="burst" />
          </div>
        </div>
      )}
      <footer
        key={status === "answering" ? "ask" : `fb-${current.key}`}
        className={`fixed bottom-0 left-0 right-0 z-10 max-h-[78vh] overflow-y-auto border-t ${status === "answering" ? "" : "vd-slide-up"} ${
          status === "right"
            ? "vd-glass-ok border-farol-ok"
            : status === "wrong"
              ? "vd-glass-bad border-farol-bad"
              : "vd-glass border-farol-line"
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          {status === "answering" ? (
            <>
              <p className="hidden text-sm text-farol-muted sm:block">
                Dica: use as teclas 1–4 e Enter
              </p>
              <Button
                variant="primary"
                className="w-full sm:w-auto sm:min-w-[180px]"
                disabled={!canCheck(current.question, answer)}
                onClick={check}
              >
                Verificar
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-3" role="status" aria-live="polite">
                <Faroldo
                  className={`h-11 w-11 sm:h-14 sm:w-14 ${status === "right" ? "vd-hop" : ""}`}
                  mood={status === "right" ? "feliz" : "atento"}
                />
                <div className="min-w-0">
                  <Eyebrow className={status === "right" ? "text-farol-ok" : "text-farol-bad"}>
                    Faroldo diz
                  </Eyebrow>
                  <p className={`font-display text-xl font-extrabold leading-tight tracking-tight ${status === "right" ? "text-farol-ok" : "text-farol-bad"}`}>
                    {status === "right" ? praiseText : "Essa não foi a melhor escolha. Veja o porquê:"}
                    {status === "right" && gain > 0 && (
                      <span className="vd-float ml-2 inline-flex items-center gap-0.5 align-middle font-num text-sm font-black text-farol-accent">
                        <XpIcon className="h-4 w-4" />+{gain}
                      </span>
                    )}
                  </p>
                  {status === "wrong" && (
                    <p className="mt-1 font-semibold text-farol-ink">
                      {correctAnswerText(current.question)}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-farol-ink/85">
                    {current.question.explanation}
                  </p>
                </div>
              </div>
              <Button
                variant={status === "right" ? "success" : "danger"}
                className="w-full shrink-0 sm:w-auto sm:min-w-[180px]"
                onClick={next}
                autoFocus
              >
                Continuar
              </Button>
            </>
          )}
        </div>
      </footer>

      {quitOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/80 sm:items-center" onClick={() => setQuitOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl border border-farol-line bg-farol-surface p-6 text-center sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <Faroldo className="mx-auto h-14 w-14" mood="atento" />
            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight">
              Sair agora?
            </h2>
            <p className="mt-1 text-farol-muted">
              Você vai perder o progresso desta lição.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button variant="primary" onClick={() => setQuitOpen(false)}>
                Continuar treinando
              </Button>
              <Link href="/farol" className="py-2 font-display font-extrabold uppercase tracking-wide text-farol-bad">
                Sair da lição
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Telas finais ------------------------------ */

const weekLetters = ["S", "T", "Q", "Q", "S", "S", "D"];

/** Etapa da chama: o dia de hoje acende e o contador vira para o novo número */
const ChamaStep = ({
  before,
  after,
  onContinue,
}: {
  before: number;
  after: number;
  onContinue: () => void;
}) => {
  const activeDays = useFarolStore((s) => s.activeDays);
  const frozenDays = useFarolStore((s) => s.frozenDays);
  const now = dayjs();
  const monday = now.subtract((now.day() + 6) % 7, "day");
  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden px-4 py-8 text-center sm:py-10">
      <div aria-hidden className="vd-aura vd-aura-ouro left-1/2 top-[14%] -ml-40 h-80 w-80" />
      <div className="relative flex grow flex-col items-center justify-center gap-5">
        <Eyebrow className="text-farol-warn">Lição concluída · chama acesa</Eyebrow>
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div aria-hidden className="vd-ember absolute inset-4 rounded-full" />
          <FlameIcon className="vd-ignite relative h-40 w-40" />
        </div>
        <div
          className="vd-roll relative h-[4.5rem] overflow-hidden font-num text-7xl font-black tabular-nums leading-[4.5rem]"
          role="status"
          aria-label={`${after} ${after === 1 ? "dia" : "dias"} de chama`}
        >
          <div className="vd-roll-track">
            <span className="block text-farol-muted">{before}</span>
            <span className="vd-gold block">{after}</span>
          </div>
        </div>
        <p className="font-display text-xl font-extrabold tracking-tight">
          {after === 1 ? "dia de chama acesa" : "dias de chama acesa"}
        </p>
        <ol className={`${card} flex w-full justify-between gap-1 p-4`}>
          {weekLetters.map((letter, i) => {
            const date = monday.add(i, "day");
            const key = date.format("YYYY-MM-DD");
            const isToday = date.isSame(now, "day");
            const done = activeDays.includes(key);
            const frozen = frozenDays.includes(key);
            return (
              <li key={key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className={`text-xs font-semibold ${isToday ? "text-farol-warn" : "text-farol-muted"}`}>
                  {letter}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isToday
                      ? "vd-day-on"
                      : done
                        ? "bg-farol-warn-soft"
                        : frozen
                          ? "bg-farol-ok-soft"
                          : "bg-farol-surface2"
                  }`}
                >
                  {(done || isToday) && <FlameIcon className="h-5 w-5" />}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="max-w-xs text-sm text-farol-muted">
          {after === 1
            ? "Primeiro dia aceso. Volte amanhã para manter a chama."
            : "Um pouco por dia vale mais que muito de vez em quando."}
        </p>
      </div>
      <footer className="relative mt-8">
        <Button className="w-full" onClick={onContinue} autoFocus>
          Continuar
        </Button>
      </footer>
    </div>
  );
};

const StatCard = ({ label, value, tone }: { label: string; value: ReactNode; tone: string }) => (
  <div className={`${card} flex-1 px-2 py-3`}>
    <Eyebrow>{label}</Eyebrow>
    <p className={`mt-1 font-num text-2xl font-black tabular-nums ${tone}`}>{value}</p>
  </div>
);

const faroldoResumo: Record<Sinal, string> = {
  verde:
    "Farol verde! Você dominou essa lição. Leve esse raciocínio para a próxima visita.",
  amarelo:
    "Farol amarelo: bom caminho, mas vale refazer para fixar os pontos em que você hesitou.",
  vermelho:
    "Farol vermelho: sem crise, é treinando que acende. Refaça a lição com calma e leia as explicações.",
};

const Row = ({ children, className }: { children: ReactNode; className: string }) => (
  <p className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold ${className}`}>
    {children}
  </p>
);

const LessonSummary = ({
  summary,
  lesson,
  onCelebrate,
  onRestart,
}: {
  summary: Summary;
  lesson: Lesson;
  /** última lição da trilha: "Continuar" leva à tela de parabéns */
  onCelebrate?: () => void;
  onRestart: () => void;
}) => {
  const avatar = useFarolStore((s) => s.avatar);
  // a próxima lição é sempre da mesma linha de treino
  const list = lessonListOf(lesson.id);
  const index = list.findIndex((l) => l.lesson.id === lesson.id);
  const nextLessonId = list[index + 1]?.lesson.id;
  const perfect = summary.accuracy === 1;
  const sinal = sinalDaPrecisao(summary.accuracy);
  const info = sinalInfo[sinal];
  const mins = Math.floor(summary.seconds / 60);
  const secs = String(summary.seconds % 60).padStart(2, "0");
  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden px-4 py-8 text-center sm:py-10">
      {sinal !== "vermelho" && <Confetti kind="rain" count={sinal === "verde" ? 90 : 40} />}
      <Feixe className="-top-40 left-1/2 -ml-56 h-[28rem] w-[28rem]" />
      {/* luz difusa de fundo, na cor do resultado */}
      <div aria-hidden className={`vd-aura left-[-20%] top-[8%] h-72 w-72 ${sinal === "verde" ? "vd-aura-verde" : sinal === "amarelo" ? "vd-aura-ouro" : "vd-aura-roxo"}`} />
      <div aria-hidden className="vd-aura vd-aura-rosa right-[-25%] top-[32%] h-80 w-80" />
      <div className="vd-stagger relative flex grow flex-col items-center justify-center gap-4">
        <div className="vd-pop">
          <Semaforo sinal={sinal} size="lg" />
        </div>
        <div>
          <Pill tone={sinal} className="uppercase tracking-[.09em]">
            {info.label} · {Math.round(summary.accuracy * 100)}% de precisão
          </Pill>
          <h1 className="vd-pop mt-3 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl" style={{ animationDelay: "0.25s" }}>
            {perfect ? "Lição perfeita!" : "Lição concluída!"}
          </h1>
          <p className="mt-2 text-farol-muted">{lesson.title}</p>
        </div>
        <div className="relative flex h-44 w-44 items-center justify-center">
          {sinal !== "vermelho" && (
            <>
              <div aria-hidden className="vd-rays absolute -inset-12" />
              {[
                ["-left-6 top-2", "0s", "text-farol-warn"],
                ["-right-5 top-8", "0.5s", "text-white"],
                ["-left-3 bottom-4", "0.9s", "text-farol-accent"],
                ["-right-7 bottom-8", "0.3s", "text-farol-warn"],
                ["left-1/2 -top-7", "0.7s", "text-farol-ok"],
              ].map(([pos, delay, tone]) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`vd-twinkle absolute text-2xl ${pos} ${tone}`}
                  style={{ animationDelay: delay }}
                >
                  ✦
                </span>
              ))}
            </>
          )}
          <Avatar
            config={avatar}
            animated
            interactive
            celebrate={sinal !== "vermelho"}
            mood={sinal === "vermelho" ? "surpreso" : "feliz"}
            className="relative h-36 w-36 rounded-full border-4 border-farol-accent"
          />
        </div>

        <div className="flex w-full gap-3">
          <StatCard label="Faíscas" value={<CountUp value={summary.xp} prefix="+" delay={500} />} tone="text-farol-accent" />
          <StatCard label="Precisão" value={<CountUp value={Math.round(summary.accuracy * 100)} suffix="%" delay={650} />} tone={info.text} />
          <StatCard label="Tempo" value={`${mins}:${secs}`} tone="text-farol-ink" />
        </div>

        <div className={`${card} flex w-full items-start gap-3 p-4 text-left`}>
          <Faroldo className="h-11 w-11" mood={sinal === "verde" ? "feliz" : "atento"} />
          <div>
            <Eyebrow className="text-farol-accent">Faroldo diz</Eyebrow>
            <p className="mt-0.5 text-sm">{faroldoResumo[sinal]}</p>
          </div>
        </div>

        <div className="vd-stagger flex w-full flex-col gap-2 text-left">
          <Row className="bg-farol-warn-soft text-farol-warn">
            <CoinIcon className="h-6 w-6" /> +{summary.coins} moedas
          </Row>
          {summary.bestCombo >= 3 && (
            <Row className="bg-farol-accent-soft text-farol-accent">
              <XpIcon className="h-6 w-6" /> Melhor combo: {summary.bestCombo} seguidas
            </Row>
          )}
          {summary.levelUp && (
            <Row className="bg-farol-accent text-white">
              ⬆️ Novo nível: {summary.levelUp}
            </Row>
          )}
          {summary.newBadges.map((b) => (
            <Row key={b.id} className="bg-farol-ok-soft text-farol-ok">
              <span aria-hidden>{b.icon}</span> Conquista desbloqueada: {b.title}
            </Row>
          ))}
        </div>
      </div>
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row-reverse">
        {onCelebrate ? (
          <button
            onClick={onCelebrate}
            autoFocus
            className={`flex-1 ${buttonBase} ${buttonVariants.primary}`}
          >
            Continuar
          </button>
        ) : nextLessonId ? (
          <Link href={`/farol/licao/${nextLessonId}`} className={`flex-1 ${buttonBase} ${buttonVariants.primary}`}>
            Próxima lição
          </Link>
        ) : (
          <Link href="/farol" className={`flex-1 ${buttonBase} ${buttonVariants.primary}`}>
            Continuar
          </Link>
        )}
        <Link href="/farol" className={`flex-1 ${buttonBase} ${buttonVariants.ghost}`}>
          Voltar à trilha
        </Link>
      </div>
      <button
        onClick={onRestart}
        className="relative mt-4 self-center text-sm font-semibold uppercase tracking-[.09em] text-farol-muted hover:text-farol-ink"
      >
        Refazer esta lição
      </button>
    </div>
  );
};


/* -------------------------------- Página ---------------------------------- */

const LessonPage: NextPage = () => {
  const router = useRouter();
  const hydrated = useHydrated();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const found = findLesson(id);
  const records = useFarolStore((s) => s.lessons);
  const locked = found ? getLessonStatus(found.lesson.id, records) === "locked" : false;
  const [attempt, setAttempt] = useState(0);

  return (
    <FarolShell title={found?.lesson.title ?? "Lição"}>
      {!hydrated || !router.isReady ? null : found && !locked ? (
        <LessonPlayer
          key={`${id}-${attempt}`}
          lesson={found.lesson}
          onRestart={() => {
            window.scrollTo(0, 0);
            setAttempt((n) => n + 1);
          }}
        />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="font-display text-xl font-extrabold tracking-tight">
            {locked ? "Essa lição ainda está bloqueada." : "Lição não encontrada."}
          </p>
          <Link href="/farol" className="font-semibold text-farol-accent hover:underline">
            Voltar para a trilha
          </Link>
        </div>
      )}
    </FarolShell>
  );
};

export default LessonPage;
