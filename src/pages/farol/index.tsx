import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { units } from "~/farol/content";
import { FarolLayout } from "~/farol/components/FarolLayout";
import {
  CheckIcon,
  LockIcon,
  StarIcon,
} from "~/farol/components/Icons";
import {
  getCurrentLesson,
  getLessonStatus,
  type LessonStatus,
} from "~/farol/gamification";
import { useFarolStore } from "~/farol/store";
import type { Lesson, Unit } from "~/farol/types";

/** deslocamento horizontal em zigue-zague dos nós da trilha */
const offsets = [0, 44, 70, 44, 0, -44, -70, -44];

const nodeIcon = (lesson: Lesson, status: LessonStatus) => {
  if (status === "locked")
    return lesson.kind === "desafio" ? (
      <span className="text-3xl grayscale">🏆</span>
    ) : (
      <LockIcon className="h-8 w-8 text-gray-400" />
    );
  if (lesson.kind === "desafio") return <span className="text-3xl">🏆</span>;
  if (status === "done") return <CheckIcon className="h-9 w-9 text-white" />;
  return <StarIcon className="h-9 w-9 text-white" />;
};

const LessonNode = ({
  lesson,
  unit,
  index,
  selected,
  onSelect,
}: {
  lesson: Lesson;
  unit: Unit;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) => {
  const records = useFarolStore((s) => s.lessons);
  const status = getLessonStatus(lesson.id, records);
  const record = records[lesson.id];
  const offset = offsets[index % offsets.length]!;
  const isChallenge = lesson.kind === "desafio";

  const bg =
    status === "locked"
      ? "#e5e7eb"
      : isChallenge
        ? "#0f2742"
        : unit.color;
  const border =
    status === "locked" ? "#c4c7cc" : isChallenge ? "#06162a" : unit.shade;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {status === "current" && !selected && (
        <div className="absolute -top-12 z-10 animate-bounce whitespace-nowrap rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-wide shadow-sm" style={{ color: unit.color }}>
          {record ? "Repetir" : "Começar"}
          <div className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-gray-200 bg-white" />
        </div>
      )}

      {status === "current" && (
        <div
          className="absolute -inset-2 rounded-full border-[6px] opacity-30"
          style={{ borderColor: unit.color }}
          aria-hidden
        />
      )}

      <button
        onClick={onSelect}
        aria-label={`${lesson.title}${status === "locked" ? " (bloqueada)" : ""}`}
        className={`relative flex items-center justify-center rounded-full transition active:translate-y-1 ${
          isChallenge ? "h-[76px] w-[76px]" : "h-[70px] w-[70px]"
        }`}
        style={{
          backgroundColor: bg,
          boxShadow: `0 7px 0 ${border}`,
        }}
      >
        {nodeIcon(lesson, status)}
      </button>

      {record && (
        <div className="mt-3 flex gap-0.5" aria-label={`Melhor precisão ${Math.round(record.bestAccuracy * 100)}%`}>
          {[0.5, 0.8, 1].map((threshold) => (
            <StarIcon
              key={threshold}
              className={`h-4 w-4 ${record.bestAccuracy >= threshold ? "text-amber-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      )}

      {selected && (
        <LessonPopover lesson={lesson} unit={unit} status={status} />
      )}
    </div>
  );
};

const LessonPopover = ({
  lesson,
  unit,
  status,
}: {
  lesson: Lesson;
  unit: Unit;
  status: LessonStatus;
}) => {
  const hearts = useFarolStore((s) => s.hearts);
  const locked = status === "locked";
  const isChallenge = lesson.kind === "desafio";
  const color = locked ? "#e5e7eb" : isChallenge ? "#0f2742" : unit.color;

  return (
    <div
      className="absolute top-[92px] z-20 w-72 rounded-2xl p-4 text-left shadow-lg"
      style={{ backgroundColor: color }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
        style={{ backgroundColor: color }}
      />
      <p className={`text-lg font-extrabold ${locked ? "text-gray-500" : "text-white"}`}>
        {lesson.title}
      </p>
      <p className={`mb-3 text-sm ${locked ? "text-gray-500" : "text-white/85"}`}>
        {locked
          ? "Conclua as lições anteriores para desbloquear."
          : `${lesson.questions.length} questões${isChallenge ? " · XP em dobro" : ""}`}
      </p>
      {locked ? (
        <span className="block w-full rounded-2xl bg-gray-300 py-3 text-center font-extrabold uppercase text-gray-500">
          Bloqueada
        </span>
      ) : hearts === 0 ? (
        <Link
          href="/farol/conquistas#loja"
          className="block w-full rounded-2xl border-b-4 border-gray-300 bg-white py-3 text-center font-extrabold uppercase text-rose-500"
        >
          Sem vidas · recarregar
        </Link>
      ) : (
        <Link
          href={`/farol/licao/${lesson.id}`}
          className="block w-full rounded-2xl border-b-4 border-gray-300 bg-white py-3 text-center font-extrabold uppercase transition hover:brightness-95"
          style={{ color: isChallenge ? "#0f2742" : unit.shade }}
        >
          {status === "done" ? "Praticar de novo" : "Começar"}
        </Link>
      )}
    </div>
  );
};

const UnitHeader = ({ unit }: { unit: Unit }) => (
  <header
    className="flex items-center justify-between rounded-2xl p-5 text-white"
    style={{ backgroundColor: unit.color, boxShadow: `0 5px 0 ${unit.shade}` }}
  >
    <div>
      <p className="text-sm font-bold uppercase tracking-wider text-white/80">
        Unidade {unit.number}
      </p>
      <h2 className="text-2xl font-extrabold">{unit.title}</h2>
      <p className="text-white/90">{unit.description}</p>
    </div>
  </header>
);

const Trail = () => {
  const records = useFarolStore((s) => s.lessons);
  const name = useFarolStore((s) => s.name);
  const [selected, setSelected] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const current = getCurrentLesson(records);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  useEffect(() => {
    const close = () => setSelected(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <>
      {name && (
        <p className="mb-4 text-gray-500">
          Olá, <strong className="text-[#0f2742]">{name}</strong>!{" "}
          {current
            ? `Próxima parada: ${current.lesson.title}.`
            : "Você concluiu a trilha inteira! 🌟"}
        </p>
      )}
      <div className="flex flex-col gap-10">
        {units.map((unit) => (
          <section key={unit.id} className="flex flex-col gap-10">
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
                    unit={unit}
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
    </>
  );
};

const TrilhaPage: NextPage = () => (
  <FarolLayout title="Trilha">
    <Trail />
  </FarolLayout>
);

export default TrilhaPage;
