import type { NextPage } from "next";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { lessonsByLinha, linhaAtual, linhas } from "~/farol/content";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { Avatar } from "~/farol/components/Avatar";
import { Confetti } from "~/farol/components/Celebrate";
import { useSounds } from "~/farol/hooks";
import { GIFT_AFTER_LESSON, type Gift, giftOfUnit } from "~/farol/presentes";
import { findItem } from "~/farol/shop";
import { TrailEndCard } from "~/farol/components/TrailEnd";
import { CheckIcon, LockIcon, ShieldIcon, StarIcon } from "~/farol/components/Icons";
import {
  Button,
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
import { type GiftResult, useFarolStore } from "~/farol/store";
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
        {selected && (
          <LessonPopover
            lesson={lesson}
            status={status}
            offset={offset}
            nodeSize={isChallenge ? 76 : 70}
          />
        )}
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

    </div>
  );
};

const LessonPopover = ({
  lesson,
  status,
  offset,
  nodeSize,
}: {
  lesson: Lesson;
  status: LessonStatus;
  /** deslocamento do nó: o balão volta para o centro da coluna */
  offset: number;
  nodeSize: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // garante que o balão inteiro apareça, sem ficar atrás do topo ou do rodapé
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  const record = useFarolStore((s) => s.lessons[lesson.id]);
  const locked = status === "locked";
  const isChallenge = lesson.kind === "desafio";
  const sinal = record ? sinalDaPrecisao(record.bestAccuracy) : null;

  return (
    <div
      ref={ref}
      className="vd-pop absolute left-1/2 z-20 w-72 origin-bottom scroll-mb-28 scroll-mt-24 rounded-2xl border border-farol-line bg-farol-surface2 p-4 text-left shadow-2xl"
      // o botão de ação fica exatamente sobre o ponto tocado: o centro do
      // botão (16px de borda + 26px de meia altura) coincide com o centro do nó
      style={{
        bottom: nodeSize / 2 - 42,
        marginLeft: -144 - offset,
        animationDuration: "0.22s",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Eyebrow className={isChallenge ? "text-farol-warn" : "text-farol-muted"}>
            {isChallenge ? "Desafio · faíscas em dobro" : "Lição"}
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
            : `${lesson.questions.length} situações · cerca de 3 minutos`}
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
        <Eyebrow className={unit.tema === "produto" ? "text-farol-warn" : "text-farol-muted"}>
          Unidade {unit.number} · {unit.tema === "produto" ? "Produto" : "Vendas"}
        </Eyebrow>
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

/* -------------------------------- Presentes ------------------------------- */

/** Nó de presente na trilha: um e-mail de cliente, liberado ao concluir a lição anterior */
const GiftNode = ({
  gift,
  unlocked,
  index,
  onOpen,
}: {
  gift: Gift;
  unlocked: boolean;
  index: number;
  onOpen: () => void;
}) => {
  const claimed = useFarolStore((s) => s.gifts.includes(gift.unitId));
  const offset = offsets[index % offsets.length]!;
  const waiting = unlocked && !claimed;
  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {waiting && (
        <span className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-farol-accent font-num text-xs font-extrabold text-white">
          1
        </span>
      )}
      <button
        onClick={onOpen}
        disabled={!unlocked}
        aria-label={
          claimed
            ? `E-mail de ${gift.from.nome} (presente já recebido)`
            : unlocked
              ? `Novo e-mail de ${gift.from.nome}: abrir presente`
              : "Presente bloqueado: conclua a lição anterior"
        }
        className={`flex h-[62px] w-[74px] items-center justify-center rounded-2xl border transition active:translate-y-1 ${
          waiting
            ? "vd-gift border-farol-warn bg-farol-warn-soft"
            : claimed
              ? "border-farol-line bg-farol-surface"
              : "border-farol-line bg-farol-surface2 opacity-60"
        }`}
        style={{ boxShadow: `0 6px 0 ${waiting ? "#b9841c" : "#17181c"}` }}
      >
        <svg viewBox="0 0 48 36" className="h-9 w-12" aria-hidden>
          <rect x="2" y="4" width="44" height="30" rx="5" fill={waiting ? "#f5b331" : claimed ? "#454752" : "#383a43"} />
          {claimed ? (
            <path d="M4 8 24 2l20 6-20 12Z" fill="#5a5c68" />
          ) : (
            <path d="m4 7 20 15L44 7" stroke={waiting ? "#fff" : "#6b6d78"} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {waiting && <circle cx="24" cy="24" r="5" fill="#ff0084" />}
        </svg>
      </button>
      <span className={`mt-3 text-[11px] font-semibold uppercase tracking-[.09em] ${waiting ? "text-farol-warn" : "text-farol-muted"}`}>
        {claimed ? "Presente recebido" : unlocked ? "Você tem um presente" : "Presente"}
      </span>
    </div>
  );
};

const rewardLabel = (r: GiftResult) =>
  r.kind === "moedas"
    ? `+${r.amount} moedas`
    : r.kind === "faiscas"
      ? `+${r.amount} faíscas`
      : r.name;

/** O e-mail do cliente, com o presente para receber */
const GiftEmail = ({ gift, onClose }: { gift: Gift; onClose: () => void }) => {
  const already = useFarolStore((s) => s.gifts.includes(gift.unitId));
  const claimGift = useFarolStore((s) => s.claimGift);
  const avatar = useFarolStore((s) => s.avatar);
  const sounds = useSounds();
  const [result, setResult] = useState<GiftResult | null>(null);
  const item = gift.reward.kind === "item" ? findItem(gift.reward.itemId) : undefined;
  const promised =
    gift.reward.kind === "moedas"
      ? `${gift.reward.amount} moedas`
      : gift.reward.kind === "faiscas"
        ? `${gift.reward.amount} faíscas`
        : (item?.name ?? "um item para o seu avatar");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/85 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`E-mail de ${gift.from.nome}`}
      onClick={onClose}
    >
      <div
        className="vd-slide-up relative w-full max-w-md overflow-hidden rounded-t-3xl border border-farol-line bg-farol-surface sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {result && (
          <div className="pointer-events-none absolute left-1/2 top-1/2">
            <Confetti kind="burst" count={40} />
          </div>
        )}
        <header className="flex items-center gap-3 border-b border-farol-line bg-farol-lamp px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-farol-surface2 text-2xl" aria-hidden>
            {gift.from.emoji}
          </span>
          <div className="min-w-0 grow">
            <p className="truncate font-semibold leading-tight">{gift.from.nome}</p>
            <p className="truncate text-xs text-farol-muted">{gift.from.empresa} · para você</p>
          </div>
          <Pill tone="neutro">Cliente fictício</Pill>
        </header>
        <div className="p-5">
          <h2 className="font-display text-xl font-extrabold leading-tight tracking-tight">{gift.subject}</h2>
          <p className="mt-3 leading-relaxed text-farol-ink/90">{gift.body}</p>

          <div className={`mt-5 flex items-center gap-4 rounded-2xl border p-4 ${result || already ? "border-farol-ok/60 bg-farol-ok-soft" : "border-farol-warn/60 bg-farol-warn-soft"}`}>
            {(result?.kind === "item" || (!result && item)) && item ? (
              <Avatar
                config={{ ...avatar, equipped: { ...avatar.equipped, [item.slot]: item.id } }}
                round={false}
                className="h-16 w-16"
                label=""
              />
            ) : (
              <span className="text-4xl" aria-hidden>🎁</span>
            )}
            <div className="min-w-0">
              <Eyebrow className={result || already ? "text-farol-ok" : "text-farol-warn"}>
                {result ? "Você recebeu" : already ? "Presente já recebido" : "Presente anexado"}
              </Eyebrow>
              <p className="font-display text-lg font-extrabold leading-tight tracking-tight">
                {result ? rewardLabel(result) : promised}
              </p>
              {result?.kind === "moedas" && result.insteadOf && (
                <p className="text-sm text-farol-muted">
                  Você já tinha “{result.insteadOf}”, então virou moedas.
                </p>
              )}
              {result?.kind === "item" && (
                <p className="text-sm text-farol-muted">Já está equipado no seu avatar.</p>
              )}
            </div>
          </div>

          {result || already ? (
            <Button variant="ghost" className="mt-5 w-full" onClick={onClose}>
              Fechar
            </Button>
          ) : (
            <Button
              className="mt-5 w-full"
              autoFocus
              onClick={() => {
                const r = claimGift(gift.unitId);
                if (!r) return onClose();
                sounds.levelUp();
                setResult(r);
              }}
            >
              Receber presente
            </Button>
          )}
        </div>
      </div>
    </div>
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
        <b className="font-semibold">Sua chama continua acesa!</b>{" "}
        {saved.length === 1
          ? "Um protetor de chama cobriu o dia em que você não praticou."
          : `${saved.length} protetores de chama cobriram os dias em que você não praticou.`}
      </p>
      <button onClick={dismiss} className="shrink-0 text-xs font-semibold uppercase tracking-[.09em] text-farol-accent">
        Ok
      </button>
    </div>
  );
};

/** Linha de treino aberta (a escolha do vendedor fica salva) */
const useLinha = () => {
  const id = useFarolStore((s) => s.linhaAtiva);
  const linha = linhas.find((l) => l.id === id) ?? linhas[0]!;
  return { linha, list: lessonsByLinha[linha.id]! };
};

/** Abas para trocar de linha de treino */
const LinhaTabs = () => {
  const { linha } = useLinha();
  const setLinha = useFarolStore((s) => s.setLinhaAtiva);
  const records = useFarolStore((s) => s.lessons);
  // com uma linha só, não há o que trocar
  if (linhas.length < 2) return null;
  return (
    <div className="mb-4 flex gap-2" role="tablist" aria-label="Linhas de treino">
      {linhas.map((l) => {
        const list = lessonsByLinha[l.id]!;
        const active = l.id === linha.id;
        return (
          <button
            key={l.id}
            role="tab"
            aria-selected={active}
            onClick={() => setLinha(l.id)}
            className={`min-w-0 flex-1 rounded-2xl border border-b-4 px-3 py-2.5 text-left transition active:translate-y-0.5 ${
              active
                ? "border-farol-accent bg-farol-accent-soft"
                : "border-farol-line bg-farol-surface hover:bg-farol-surface2"
            }`}
          >
            <span className="block truncate font-display text-sm font-extrabold tracking-tight">
              {l.title}
            </span>
            <span className="font-num text-xs font-extrabold tabular-nums text-farol-muted">
              {completedLessonCount(records, list)}/{list.length}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const LinhaHero = () => {
  const records = useFarolStore((s) => s.lessons);
  const name = useFarolStore((s) => s.name);
  const avatar = useFarolStore((s) => s.avatar);
  const { linha, list } = useLinha();
  const current = getCurrentLesson(records, list);
  const done = completedLessonCount(records, list);
  const total = list.length;
  return (
    <section className={`${card} relative mb-8 overflow-hidden p-5 sm:p-6`}>
      <Feixe />
      <div className="relative">
        <Eyebrow className="text-farol-accent">Linha de treino</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
          {linha.title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-farol-muted">{linha.description}</p>
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
  const [openGift, setOpenGift] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const { linha, list } = useLinha();
  const current = getCurrentLesson(records, list);
  const started = completedLessonCount(records, list) > 0;
  const linhaDone = completedLessonCount(records, list) === list.length;

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
      <LinhaTabs />
      <LinhaHero />
      <div className="flex flex-col gap-10">
        {linha.units.map((unit) => (
          <section key={unit.id} className="flex flex-col gap-12">
            <UnitHeader unit={unit} />
            <div className="flex flex-col items-center gap-12 pb-4">
              {unit.lessons.map((lesson, i) => (
                <Fragment key={lesson.id}>
                  <div
                    ref={current?.lesson.id === lesson.id ? currentRef : undefined}
                    onClick={(e) => e.stopPropagation()}
                    className={`relative ${selected === lesson.id ? "z-30" : "z-0"}`}
                  >
                    <LessonNode
                      lesson={lesson}
                      // depois do presente, os nós descem uma casa no zigue-zague
                      index={giftOfUnit(unit.id) && i > GIFT_AFTER_LESSON ? i + 1 : i}
                      selected={selected === lesson.id}
                      onSelect={() =>
                        setSelected((s) => (s === lesson.id ? null : lesson.id))
                      }
                    />
                  </div>
                  {i === GIFT_AFTER_LESSON && giftOfUnit(unit.id) && (
                    <GiftNode
                      gift={giftOfUnit(unit.id)!}
                      unlocked={!!records[lesson.id]?.completions}
                      index={i + 1}
                      onOpen={() => setOpenGift(unit.id)}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>
      {/* fim da trilha: parabéns + aviso ao gestor; senão, espaço para o balão da última lição */}
      {openGift && giftOfUnit(openGift) && (
        <GiftEmail gift={giftOfUnit(openGift)!} onClose={() => setOpenGift(null)} />
      )}
      {!linhaDone ? (
        <div className="h-40" />
      ) : linha.id === linhaAtual.id ? (
        <div className="mt-40">
          <TrailEndCard />
        </div>
      ) : (
        <div className={`${card} mt-40 border-farol-ok/60 p-5`}>
          <Eyebrow className="text-farol-ok">Linha concluída</Eyebrow>
          <p className="mt-1 font-display text-xl font-extrabold leading-tight tracking-tight">
            Você concluiu a linha {linha.title}.
          </p>
          <p className="mt-1 text-sm text-farol-muted">
            As lições continuam abertas para você praticar quando quiser.
          </p>
        </div>
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
