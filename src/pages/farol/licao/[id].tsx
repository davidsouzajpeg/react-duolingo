import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
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
import { useHeartRegen, useHydrated, useSounds } from "~/farol/hooks";
import { notifyGestorTrailCompleted } from "~/farol/notify";
import { Parabens } from "~/farol/components/TrailEnd";
import {
  HEART_REGEN_MINUTES,
  MAX_HEARTS,
  REFILL_HEARTS_COST,
  computeStreak,
  isTrailComplete,
  useFarolStore,
} from "~/farol/store";
import type { Lesson } from "~/farol/types";

const praise = [
  "Mandou bem!",
  "Isso aí, consultor!",
  "Farol verde!",
  "Excelente leitura!",
  "É assim que se vende valor!",
  "Na medida!",
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
  /** esta lição fechou a trilha inteira */
  trailJustCompleted: boolean;
};

/* ------------------------------ Player ------------------------------------ */

const LessonPlayer = ({ lesson }: { lesson: Lesson }) => {
  const router = useRouter();
  const hearts = useFarolStore((s) => s.hearts);
  const loseHeart = useFarolStore((s) => s.loseHeart);
  const finishLesson = useFarolStore((s) => s.finishLesson);
  const sounds = useSounds();
  useHeartRegen();

  const total = lesson.questions.length;
  const isChallenge = lesson.kind === "desafio";

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
  const [celebrating, setCelebrating] = useState(false);
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
    const trailJustCompleted =
      !isTrailComplete(before.lessons) && isTrailComplete(after.lessons);
    // finishLesson já deixou o aviso "pendente"; tenta enviar agora
    if (trailJustCompleted) void notifyGestorTrailCompleted();

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
      trailJustCompleted,
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

  if (summary && celebrating) return <Parabens />;

  if (summary) {
    return (
      <LessonSummary
        summary={summary}
        lesson={lesson}
        onCelebrate={
          summary.trailJustCompleted ? () => setCelebrating(true) : undefined
        }
      />
    );
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
          className="text-farol-muted hover:text-farol-ink"
          aria-label="Sair da lição"
        >
          <CloseIcon className="h-7 w-7" />
        </button>
        <div className="relative grow">
          <ProgressBar value={solved / total} className="h-4" />
          {combo >= 3 && (
            <span className="absolute -top-6 right-0 font-num text-sm font-extrabold text-farol-warn">
              🔥 combo x{combo}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 font-num text-lg font-extrabold tabular-nums text-farol-bad" aria-label={`${hearts} vidas`}>
          <HeartIcon className="h-7 w-7" empty={hearts === 0} />
          {hearts}
        </span>
      </header>

      <main className="mx-auto w-full max-w-2xl grow px-4 pb-64 pt-8 sm:pt-14">
        {isChallenge && pos === 0 && status === "answering" && (
          <Pill tone="amarelo" className="mb-3 uppercase tracking-[.09em]">
            🏆 Desafio · XP em dobro
          </Pill>
        )}
        {missed.has(questionId(current)) && status === "answering" && pos >= total && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.09em] text-farol-warn">
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
        className={`fixed bottom-0 left-0 right-0 z-10 max-h-[78vh] overflow-y-auto border-t ${
          status === "right"
            ? "border-farol-ok bg-farol-ok-soft"
            : status === "wrong"
              ? "border-farol-bad bg-farol-bad-soft"
              : "border-farol-line bg-farol-surface"
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
                  className="h-11 w-11 sm:h-14 sm:w-14"
                  mood={status === "right" ? "feliz" : "atento"}
                />
                <div className="min-w-0">
                  <Eyebrow className={status === "right" ? "text-farol-ok" : "text-farol-bad"}>
                    Faroldo diz
                  </Eyebrow>
                  <p className={`font-display text-xl font-extrabold leading-tight tracking-tight ${status === "right" ? "text-farol-ok" : "text-farol-bad"}`}>
                    {status === "right" ? praiseText : "Quase! A resposta certa é:"}
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

const StatCard = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
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
}: {
  summary: Summary;
  lesson: Lesson;
  /** última lição da trilha: "Continuar" leva à tela de parabéns */
  onCelebrate?: () => void;
}) => {
  const perfect = summary.accuracy === 1;
  const sinal = sinalDaPrecisao(summary.accuracy);
  const info = sinalInfo[sinal];
  const mins = Math.floor(summary.seconds / 60);
  const secs = String(summary.seconds % 60).padStart(2, "0");
  const streakGrew = summary.streakAfter > summary.streakBefore;
  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden px-4 py-8 text-center sm:py-10">
      <Feixe className="-top-40 left-1/2 -ml-56 h-[28rem] w-[28rem]" />
      <div className="relative flex grow flex-col items-center justify-center gap-4">
        <Semaforo sinal={sinal} size="lg" />
        <div>
          <Pill tone={sinal} className="uppercase tracking-[.09em]">
            {info.label} · {Math.round(summary.accuracy * 100)}% de precisão
          </Pill>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            {perfect ? "Lição perfeita!" : "Lição concluída!"}
          </h1>
          <p className="mt-2 text-farol-muted">{lesson.title}</p>
        </div>

        <div className="flex w-full gap-3">
          <StatCard label="XP" value={`+${summary.xp}`} tone="text-farol-accent" />
          <StatCard label="Precisão" value={`${Math.round(summary.accuracy * 100)}%`} tone={info.text} />
          <StatCard label="Tempo" value={`${mins}:${secs}`} tone="text-farol-ink" />
        </div>

        <div className={`${card} flex w-full items-start gap-3 p-4 text-left`}>
          <Faroldo className="h-11 w-11" mood={sinal === "verde" ? "feliz" : "atento"} />
          <div>
            <Eyebrow className="text-farol-accent">Faroldo diz</Eyebrow>
            <p className="mt-0.5 text-sm">{faroldoResumo[sinal]}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 text-left">
          <Row className="bg-farol-warn-soft text-farol-warn">
            <CoinIcon className="h-6 w-6" /> +{summary.coins} moedas
          </Row>
          {summary.bestCombo >= 3 && (
            <Row className="bg-farol-accent-soft text-farol-accent">
              <XpIcon className="h-6 w-6" /> Melhor combo: {summary.bestCombo} seguidas
            </Row>
          )}
          {streakGrew && (
            <Row className="bg-farol-warn-soft text-farol-warn">
              <FlameIcon className="h-6 w-6" /> Sequência de {summary.streakAfter} {summary.streakAfter === 1 ? "dia" : "dias"}!
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
        ) : (
          <Link href="/farol" className={`flex-1 ${buttonBase} ${buttonVariants.primary}`}>
            Continuar
          </Link>
        )}
        <a
          href={`/farol/licao/${lesson.id}`}
          className={`flex-1 ${buttonBase} ${buttonVariants.ghost}`}
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
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Suas vidas acabaram</h1>
      <p className="text-farol-muted">
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
        <p className="text-sm text-farol-muted">Você tem {coins} moedas.</p>
      )}
      <button onClick={onQuit} className="py-2 font-display font-extrabold uppercase tracking-wide text-farol-muted hover:text-farol-ink">
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
    <FarolShell title={found?.lesson.title ?? "Lição"}>
      {!hydrated || !router.isReady ? null : found && !locked ? (
        <LessonPlayer key={id} lesson={found.lesson} />
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
