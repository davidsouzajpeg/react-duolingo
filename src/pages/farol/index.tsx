import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { allLessons, linhaAtual, units } from "~/farol/content";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { Avatar } from "~/farol/components/Avatar";
import { TrailEndCard } from "~/farol/components/TrailEnd";
import { CheckIcon, LockIcon, ShieldIcon, StarIcon } from "~/farol/components/Icons";
import {
  Eyebrow,
  Feixe,
  Pill,
  ProgressBar,
  Semaforo,
  buttonBase,
  buttonVariants,
  card,
  sinalDaPrecisao,
  sinalInfo,
} from "~/farol/components/ui";
import {
  completedLessonCount,
  getCurrentLesson,
  getLessonStatus,
  type LessonStatus,
} from "~/farol/gamification";
import { useFarolStore } from "~/farol/store";
import type { Lesson, Unit } from "~/farol/types";

/** deslocamento horizontal em zigue-zague dos nós da trilha */
const offsets = [0, 44, 70, 44, 0, -44, -70, -44];

const nodeColors: Record<LessonStatus, { bg: string; shade: string }> = {
  done: { bg: "#3fcf86", shade: "#2a9c63" },
  current: { bg: "#ff0084", shade: "#c4006a" },
  locked: { bg: "#2d2f36", shade: "#1f2026" },
};

const nodeIcon = (lesson: Lesson, status: LessonStatus) => {
  if (status === "locked")
    return lesson.kind === "desafio" ? (
      <span className="text-3xl opacity-40 grayscale">🏆</span>
    ) : (
      <LockIcon className="h-7 w-7 text-farol-muted/70" />
    );
  if (lesson.kind === "desafio") return <span className="text-3xl">🏆</span>;
  if (status === "done") return <CheckIcon className="h-9 w-9 text-farol-lamp" />;
  return <StarIcon className="h-9 w-9 text-white" />;
};

const LessonNode = ({
  lesson,
  index,
  selected,
  onSelect,
}: {
  lesson: Lesson;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) => {
  const records = useFarolStore((s) => s.lessons);
  const status = getLessonStatus(lesson.id, records);
  const record = records[lesson.id];
  const offset = offsets[index % offsets.length]!;
  const isChallenge = lesson.kind === "desafio";
  const { bg, shade } = nodeColors[status];

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {status === "current" && !selected && (
        <div className="absolute -top-12 z-10 animate-bounce whitespace-nowrap rounded-xl bg-farol-papel px-3 py-2 font-display text-sm font-extrabold uppercase tracking-wide text-farol-accent-dark shadow-lg motion-reduce:animate-none">
          Começar
          <div className="absolute -bottom-[5px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-farol-papel" />
        </div>
      )}

      <div className="relative">
        {status === "current" && (
          <div
            className="absolute -inset-2.5 animate-farol-pulso rounded-full border-[5px] border-farol-accent motion-reduce:animate-none"
            style={{ boxShadow: "0 0 26px rgba(255,0,132,.55)" }}
            aria-hidden
          />
        )}
        <button
          onClick={onSelect}
          aria-label={`${lesson.title}${status === "locked" ? " (bloqueada)" : ""}`}
          aria-expanded={selected}
          className={`relative flex items-center justify-center rounded-full transition active:translate-y-1 ${
            isChallenge ? "h-[76px] w-[76px]" : "h-[70px] w-[70px]"
          } ${status === "locked" ? "border border-farol-line" : ""}`}
          style={{ backgroundColor: bg, boxShadow: `0 7px 0 ${shade}` }}
        >
          {nodeIcon(lesson, status)}
        </button>
      </div>

      {/* Farol da lição: melhor precisão já alcançada */}
      {record && (
        <Semaforo
          horizontal
          size="xs"
          sinal={sinalDaPrecisao(record.bestAccuracy)}
          className="mt-4"
        />
      )}

      {selected && <LessonPopover lesson={lesson} status={status} offset={offset} />}
    </div>
  );
};

const LessonPopover = ({
  lesson,
  status,
  offset,
}: {
  lesson: Lesson;
  status: LessonStatus;
  /** deslocamento do nó: o balão volta para o centro da coluna */
  offset: number;
}) => {
  const record = useFarolStore((s) => s.lessons[lesson.id]);
  const locked = status === "locked";
  const isChallenge = lesson.kind === "desafio";
  const sinal = record ? sinalDaPrecisao(record.bestAccuracy) : null;

  return (
    <div
      className="absolute top-[94px] z-20 w-72 rounded-2xl border border-farol-line bg-farol-surface2 p-4 text-left shadow-2xl"
      style={{ transform: `translateX(${-offset}px)` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-farol-line bg-farol-surface2"
        style={{ left: `calc(50% + ${offset}px)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Eyebrow className={isChallenge ? "text-farol-warn" : "text-farol-muted"}>
            {isChallenge ? "Desafio · XP em dobro" : "Lição"}
          </Eyebrow>
          <p className="mt-1 font-display text-lg font-extrabold leading-tight tracking-tight">
            {lesson.title}
          </p>
        </div>
        <Semaforo sinal={sinal} size="sm" />
      </div>
      <p className="mb-3 mt-2 text-sm text-farol-muted">
        {locked
          ? "Conclua as lições anteriores para desbloquear."
          : sinal && record
            ? `${sinalInfo[sinal].label} · melhor precisão ${Math.round(record.bestAccuracy * 100)}%`
            : `${lesson.questions.length} questões · cerca de 3 minutos`}
      </p>
      {locked ? (
        <span className="block w-full rounded-2xl border border-farol-line bg-farol-surface py-3 text-center font-display font-extrabold uppercase tracking-wide text-farol-muted">
          Bloqueada
        </span>
      ) : (
        <Link
          href={`/farol/licao/${lesson.id}`}
          className={`block w-full ${buttonBase} ${
            status === "done" ? buttonVariants.ghost : buttonVariants.primary
          }`}
        >
          {status === "done" ? "Praticar de novo" : "Começar"}
        </Link>
      )}
    </div>
  );
};

const UnitHeader = ({ unit }: { unit: Unit }) => {
  const records = useFarolStore((s) => s.lessons);
  const done = unit.lessons.filter((l) => records[l.id]?.completions).length;
  const complete = done === unit.lessons.length;
  return (
    <header className={`${card} flex items-center gap-4 border-l-4 p-5 ${complete ? "border-l-farol-ok" : "border-l-farol-accent"}`}>
      <div className="min-w-0 grow">
        <Eyebrow>Unidade {unit.number}</Eyebrow>
        <h2 className="mt-1 font-display text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
          {unit.title}
        </h2>
        <p className="mt-1 text-sm text-farol-muted">{unit.description}</p>
      </div>
      <Pill tone={complete ? "verde" : done > 0 ? "rosa" : "neutro"} className="shrink-0 font-num text-sm font-extrabold tabular-nums">
        {done}/{unit.lessons.length}
      </Pill>
    </header>
  );
};

/** Aviso de que o bloqueio de ofensiva salvou dias sem prática */
const FreezeNotice = () => {
  const saved = useFarolStore((s) => s.freezeNotice);
  const dismiss = useFarolStore((s) => s.dismissFreezeNotice);
  if (saved.length === 0) return null;
  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-sky-400/60 bg-sky-400/10 p-4" role="status">
      <ShieldIcon className="h-9 w-9 shrink-0" />
      <p className="grow text-sm">
        <b className="font-semibold">Sua ofensiva foi salva!</b>{" "}
        {saved.length === 1
          ? "Um bloqueio de ofensiva cobriu o dia em que você não praticou."
          : `${saved.length} bloqueios de ofensiva cobriram os dias em que você não praticou.`}
      </p>
      <button onClick={dismiss} className="shrink-0 text-xs font-semibold uppercase tracking-[.09em] text-farol-accent">
        Ok
      </button>
    </div>
  );
};

const LinhaHero = () => {
  const records = useFarolStore((s) => s.lessons);
  const name = useFarolStore((s) => s.name);
  const avatar = useFarolStore((s) => s.avatar);
  const current = getCurrentLesson(records);
  const done = completedLessonCount(records);
  const total = allLessons.length;
  return (
    <section className={`${card} relative mb-8 overflow-hidden p-5 sm:p-6`}>
      <Feixe />
      <div className="relative">
        <Eyebrow className="text-farol-accent">Linha de treino</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
          {linhaAtual.title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-farol-muted">{linhaAtual.description}</p>
        <div className="mt-5 flex items-center gap-3">
          <ProgressBar value={done / total} className="h-2.5" />
          <span className="shrink-0 font-num text-sm font-extrabold tabular-nums">
            {done}/{total} <span className="font-body font-normal text-farol-muted">lições</span>
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Avatar config={avatar} animated interactive className="h-20 w-20 rounded-full border-2 border-farol-accent" />
        <p className="text-sm text-farol-muted">
          {name ? (
            <>
              <strong className="text-farol-ink">Bora vendê, {name}?</strong>{" "}
            </>
          ) : null}
          {current ? (
            <>
              Sua missão de hoje leva só alguns minutos:{" "}
              <strong className="text-farol-ink">{current.lesson.title}</strong>.
            </>
          ) : (
            "Você concluiu a linha inteira! 🌟"
          )}
        </p>
        </div>
      </div>
    </section>
  );
};

const Trail = () => {
  const records = useFarolStore((s) => s.lessons);
  const [selected, setSelected] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const current = getCurrentLesson(records);
  const started = completedLessonCount(records) > 0;

  useEffect(() => {
    if (started) currentRef.current?.scrollIntoView({ block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const close = () => setSelected(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <>
      <FreezeNotice />
      <LinhaHero />
      <div className="flex flex-col gap-10">
        {units.map((unit) => (
          <section key={unit.id} className="flex flex-col gap-12">
            <UnitHeader unit={unit} />
            <div className="flex flex-col items-center gap-12 pb-4">
              {unit.lessons.map((lesson, i) => (
                <div
                  key={lesson.id}
                  ref={current?.lesson.id === lesson.id ? currentRef : undefined}
                  onClick={(e) => e.stopPropagation()}
                  className={`relative ${selected === lesson.id ? "z-30" : "z-0"}`}
                >
                  <LessonNode
                    lesson={lesson}
                    index={i}
                    selected={selected === lesson.id}
                    onSelect={() =>
                      setSelected((s) => (s === lesson.id ? null : lesson.id))
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {/* fim da trilha: parabéns + aviso ao gestor; senão, espaço para o balão da última lição */}
      {completedLessonCount(records) === allLessons.length ? (
        <div className="mt-40">
          <TrailEndCard />
        </div>
      ) : (
        <div className="h-40" />
      )}
    </>
  );
};

const TrilhaPage: NextPage = () => (
  <FarolLayout title="Trilha">
    <Trail />
  </FarolLayout>
);

export default TrilhaPage;
