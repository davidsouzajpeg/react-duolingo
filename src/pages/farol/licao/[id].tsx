import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { findLesson } from "~/farol/content";
import {
  CloseIcon,
  CoinIcon,
  FlameIcon,
  HeartIcon,
  XpIcon,
} from "~/farol/components/Icons";
import {
  type AnswerValue,
  type QuestionInstance,
  QuestionView,
  canCheck,
  correctAnswerText,
  initialAnswer,
  isCorrect,
  makeInstance,
  shuffle,
} from "~/farol/components/QuestionViews";
import { Button, ProgressBar } from "~/farol/components/ui";
import {
  badges,
  getLessonStatus,
  getLevel,
  isBadgeUnlocked,
  type Badge,
  type BadgeContext,
} from "~/farol/gamification";
import { useHeartRegen, useHydrated, useSounds } from "~/farol/hooks";
import {
  HEART_REGEN_MINUTES,
  MAX_HEARTS,
  REFILL_HEARTS_COST,
  computeStreak,
  useFarolStore,
} from "~/farol/store";
import type { Lesson, Unit } from "~/farol/types";

const praise = [
  "Mandou bem!",
  "Isso aí!",
  "Venda fechada!",
  "Excelente!",
  "Perfeito!",
  "Na mosca!",
];

const badgeContext = (): BadgeContext => {
  const s = useFarolStore.getState();
  return {
    xpTotal: s.xpTotal,
    streak: computeStreak(s.activeDays),
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
};

/* ------------------------------ Player ------------------------------------ */

const LessonPlayer = ({ lesson, unit }: { lesson: Lesson; unit: Unit }) => {
  const router = useRouter();
  const hearts = useFarolStore((s) => s.hearts);
  const loseHeart = useFarolStore((s) => s.loseHeart);
  const finishLesson = useFarolStore((s) => s.finishLesson);
  const sounds = useSounds();
  useHeartRegen();

  const total = lesson.questions.length;
  const isChallenge = lesson.kind === "desafio";
  const accent = isChallenge ? "#0f2742" : unit.color;

  const [queue, setQueue] = useState<QuestionInstance[]>(() =>
    shuffle(lesson.questions).map(makeInstance),
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const startedAt = useRef(Date.now());

  const current = queue[pos]!;
  const questionId = (inst: QuestionInstance) =>
    String(lesson.questions.indexOf(inst.question));

  const check = useCallback(() => {
    if (status !== "answering" || !canCheck(current.question, answer)) return;
    setAnswered((n) => n + 1);
    if (isCorrect(current.question, answer)) {
      sounds.correct();
      setStatus("right");
      setSolved((n) => n + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      if (nextCombo >= 3) setComboXp((x) => x + 1);
      setPraiseText(
        nextCombo >= 3
          ? `${nextCombo} seguidas! 🔥`
          : praise[Math.floor(Math.random() * praise.length)]!,
      );
    } else {
      sounds.wrong();
      setStatus("wrong");
      setCombo(0);
      loseHeart();
      setMissed((m) => new Set(m).add(questionId(current)));
      // a questão volta no fim da fila para fixar o aprendizado
      setQueue((q) => [...q, makeInstance(current.question)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, current, answer, combo]);

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

    sounds.finish();
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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missed, comboXp, answered, solved, bestCombo]);

  const next = useCallback(() => {
    if (status === "answering") return;
    if (solved >= total) return finish();
    if (status === "wrong" && useFarolStore.getState().hearts <= 0) {
      setOutOfHearts(true);
      return;
    }
    const nextPos = pos + 1;
    setPos(nextPos);
    setAnswer(initialAnswer(queue[nextPos]!.question));
    setStatus("answering");
  }, [status, solved, total, finish, pos, queue]);

  // Atalhos de teclado: Enter verifica/continua; 1–4 escolhem opções
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (summary || quitOpen || outOfHearts) return;
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
        setAnswer(current.order[n - 1]!);
      } else if (q.kind === "vf" && (n === 1 || n === 2)) {
        setAnswer(n === 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, check, next, current, summary, quitOpen, outOfHearts]);

  if (summary) {
    return <LessonSummary summary={summary} lesson={lesson} accent={accent} />;
  }

  if (outOfHearts || (hearts <= 0 && status === "answering" && answered === 0)) {
    return <OutOfHearts onQuit={() => void router.push("/farol")} onRefilled={() => {
      setOutOfHearts(false);
      if (status === "wrong") next();
    }} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-6 sm:pt-10">
        <button
          onClick={() => setQuitOpen(true)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Sair da lição"
        >
          <CloseIcon className="h-7 w-7" />
        </button>
        <div className="relative grow">
          <ProgressBar value={solved / total} color={accent} className="h-4" />
          {combo >= 3 && (
            <span className="absolute -top-6 right-0 text-sm font-extrabold text-orange-500">
              🔥 combo x{combo}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 font-bold text-rose-500" aria-label={`${hearts} vidas`}>
          <HeartIcon className="h-7 w-7" empty={hearts === 0} />
          {hearts}
        </span>
      </header>

      <main className="mx-auto w-full max-w-2xl grow px-4 pb-64 pt-8 sm:pt-14">
        {isChallenge && pos === 0 && status === "answering" && (
          <p className="mb-3 inline-block rounded-full bg-[#0f2742] px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            Desafio · XP em dobro
          </p>
        )}
        {missed.has(questionId(current)) && status === "answering" && pos >= total && (
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-500">
            ↻ Revisando um erro
          </p>
        )}
        <QuestionView
          key={current.key}
          question={current.question}
          order={current.order}
          value={answer}
          onChange={setAnswer}
          revealed={status !== "answering"}
        />
      </main>

      <footer
        className={`fixed bottom-0 left-0 right-0 border-t-2 ${
          status === "right"
            ? "border-transparent bg-green-100"
            : status === "wrong"
              ? "border-transparent bg-rose-100"
              : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          {status === "answering" ? (
            <>
              <p className="hidden text-sm text-gray-400 sm:block">
                Dica: use as teclas 1–4 e Enter
              </p>
              <Button
                variant="success"
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
                <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl sm:flex" aria-hidden>
                  {status === "right" ? "✅" : "💡"}
                </span>
                <div>
                  <p className={`text-xl font-extrabold ${status === "right" ? "text-green-700" : "text-rose-600"}`}>
                    {status === "right" ? praiseText : "Quase! Resposta certa:"}
                  </p>
                  {status === "wrong" && (
                    <p className="font-bold text-rose-600">
                      {correctAnswerText(current.question)}
                    </p>
                  )}
                  <p className={`mt-1 text-sm ${status === "right" ? "text-green-800" : "text-rose-700"}`}>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setQuitOpen(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 text-center sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl" aria-hidden>🚪</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#0f2742]">
              Sair agora?
            </h2>
            <p className="mt-1 text-gray-500">
              Você vai perder o progresso desta lição.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button variant="primary" onClick={() => setQuitOpen(false)}>
                Continuar treinando
              </Button>
              <Link href="/farol" className="py-2 font-extrabold uppercase text-rose-500">
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

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex-1 overflow-hidden rounded-2xl border-2" style={{ borderColor: color }}>
    <p className="py-1 text-xs font-extrabold uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
      {label}
    </p>
    <p className="py-3 text-xl font-extrabold" style={{ color }}>
      {value}
    </p>
  </div>
);

const LessonSummary = ({ summary, lesson, accent }: { summary: Summary; lesson: Lesson; accent: string }) => {
  const perfect = summary.accuracy === 1;
  const mins = Math.floor(summary.seconds / 60);
  const secs = String(summary.seconds % 60).padStart(2, "0");
  const streakGrew = summary.streakAfter > summary.streakBefore;
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10 text-center">
      <div className="flex grow flex-col items-center justify-center gap-4">
        <div className="text-7xl" aria-hidden>{perfect ? "🏆" : "🎉"}</div>
        <h1 className="text-3xl font-extrabold" style={{ color: accent }}>
          {perfect ? "Lição perfeita!" : "Lição concluída!"}
        </h1>
        <p className="text-gray-500">{lesson.title}</p>

        <div className="mt-2 flex w-full gap-3">
          <StatCard label="XP total" value={`+${summary.xp}`} color="#eab308" />
          <StatCard label="Precisão" value={`${Math.round(summary.accuracy * 100)}%`} color="#22c55e" />
          <StatCard label="Tempo" value={`${mins}:${secs}`} color="#0ea5e9" />
        </div>

        <div className="flex w-full flex-col gap-2 text-left">
          <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 font-bold text-amber-700">
            <CoinIcon className="h-6 w-6" /> +{summary.coins} moedas
          </p>
          {summary.bestCombo >= 3 && (
            <p className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 font-bold text-orange-600">
              <XpIcon className="h-6 w-6" /> Melhor combo: {summary.bestCombo} seguidas
            </p>
          )}
          {streakGrew && (
            <p className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 font-bold text-orange-600">
              <FlameIcon className="h-6 w-6" /> Sequência de {summary.streakAfter} {summary.streakAfter === 1 ? "dia" : "dias"}!
            </p>
          )}
          {summary.levelUp && (
            <p className="flex items-center gap-2 rounded-xl bg-[#0f2742] px-4 py-3 font-bold text-amber-300">
              ⬆️ Nova patente: {summary.levelUp}
            </p>
          )}
          {summary.newBadges.map((b) => (
            <p key={b.id} className="flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-3 font-bold text-sky-700">
              <span aria-hidden>{b.icon}</span> Conquista desbloqueada: {b.title}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
        <Link
          href="/farol"
          className="flex-1 rounded-2xl border-b-4 border-green-700 bg-green-500 py-3 font-extrabold uppercase tracking-wide text-white transition hover:brightness-105"
        >
          Continuar
        </Link>
        <a
          href={`/farol/licao/${lesson.id}`}
          className="flex-1 rounded-2xl border-2 border-b-4 border-gray-300 py-3 font-extrabold uppercase tracking-wide text-gray-500 hover:bg-gray-50"
        >
          Refazer lição
        </a>
      </div>
    </div>
  );
};

const OutOfHearts = ({ onQuit, onRefilled }: { onQuit: () => void; onRefilled: () => void }) => {
  const coins = useFarolStore((s) => s.coins);
  const refillHearts = useFarolStore((s) => s.refillHearts);
  const canRefill = coins >= REFILL_HEARTS_COST;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: MAX_HEARTS }, (_, i) => (
          <HeartIcon key={i} className="h-10 w-10" empty />
        ))}
      </div>
      <h1 className="text-2xl font-extrabold text-[#0f2742]">Suas vidas acabaram</h1>
      <p className="text-gray-500">
        Você ganha 1 vida a cada {HEART_REGEN_MINUTES} minutos, ou pode
        recarregar agora com moedas.
      </p>
      <Button
        className="mt-2 flex w-full items-center justify-center gap-2"
        disabled={!canRefill}
        onClick={() => refillHearts() && onRefilled()}
      >
        Recarregar vidas · <CoinIcon className="h-5 w-5" /> {REFILL_HEARTS_COST}
      </Button>
      {!canRefill && (
        <p className="text-sm text-gray-400">Você tem {coins} moedas.</p>
      )}
      <button onClick={onQuit} className="py-2 font-extrabold uppercase text-gray-400 hover:text-gray-600">
        Voltar para a trilha
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

  return (
    <>
      <Head>
        <title>{`${found?.lesson.title ?? "Lição"} · Farol Vendas`}</title>
      </Head>
      {!hydrated || !router.isReady ? null : found && !locked ? (
        <LessonPlayer key={id} lesson={found.lesson} unit={found.unit} />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-xl font-bold text-[#0f2742]">
            {locked ? "Essa lição ainda está bloqueada." : "Lição não encontrada."}
          </p>
          <Link href="/farol" className="font-bold text-sky-500">
            Voltar para a trilha
          </Link>
        </div>
      )}
    </>
  );
};

export default LessonPage;
