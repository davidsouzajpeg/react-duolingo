import type { NextPage } from "next";
import { useState } from "react";
import { allLessons, linhaAtual } from "~/farol/content";
import { FarolLayout } from "~/farol/components/FarolLayout";
import Link from "next/link";
import { Avatar } from "~/farol/components/Avatar";
import { OfensivaCard } from "~/farol/components/Ofensiva";
import { Eyebrow, buttonBase, buttonVariants, Faroldo, Feixe, Pill, ProgressBar, card } from "~/farol/components/ui";
import {
  badges,
  completedLessonCount,
  getLevel,
  levels,
} from "~/farol/gamification";
import { useStreak } from "~/farol/hooks";
import { useFarolStore } from "~/farol/store";

const Stat = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
  <div className={`${card} flex items-center gap-3 p-3`}>
    <span className="text-2xl" aria-hidden>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="font-num text-xl font-black tabular-nums leading-tight">{value}</p>
      <p className="text-sm leading-tight text-farol-muted">{label}</p>
    </div>
  </div>
);

const Conquistas = () => {
  const state = useFarolStore();
  const streak = useStreak();
  const [confirmReset, setConfirmReset] = useState(false);
  const level = getLevel(state.xpTotal);
  const ctx = { xpTotal: state.xpTotal, streak, stats: state.stats, lessons: state.lessons, sims: state.sims };
  const accuracy = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Perfil + patente */}
      <section className={`${card} relative overflow-hidden p-5 sm:p-6`}>
        <Feixe />
        <div className="relative">
          <div className="flex items-center gap-4">
            <Link href="/farol/loja" aria-label="Editar avatar na Loja" className="shrink-0">
              <Avatar config={state.avatar} animated className="h-20 w-20 rounded-full border-2 border-farol-accent" />
            </Link>
            <div className="min-w-0 grow">
              <Eyebrow className="text-farol-accent">{level.current.icon} {level.current.name}</Eyebrow>
              <h1 className="mt-1 truncate font-display text-3xl font-extrabold leading-none tracking-tight">
                {state.name || "Consultor"}
              </h1>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={level.progress} />
            <p className="mt-1.5 text-sm text-farol-muted">
              <b className="font-num font-extrabold tabular-nums text-farol-ink">{state.xpTotal} faíscas</b>
              {level.next ? ` · faltam ${level.next.minXp - state.xpTotal} para ${level.next.name}` : " · nível máximo"}
            </p>
          </div>
          <ol className="mt-5 flex justify-between" aria-label="Níveis">
            {levels.map((l, i) => (
              <li
                key={l.name}
                title={`${l.name} (${l.minXp} faíscas)`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg ${
                  i === level.index
                    ? "border-farol-accent bg-farol-accent-soft"
                    : i < level.index
                      ? "border-farol-line bg-farol-surface2"
                      : "border-farol-line opacity-35 grayscale"
                }`}
              >
                {l.icon}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Estatísticas */}
      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon="🔥" value={streak} label="dias de chama acesa" />
          <Stat icon="⚡" value={state.xpTotal} label="faíscas no total" />
          <Stat icon="📚" value={`${completedLessonCount(state.lessons)}/${allLessons.length}`} label="lições concluídas" />
          <Stat icon="🎯" value={`${accuracy}%`} label="precisão geral" />
        </div>
      </section>

      {/* Conquistas */}
      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Conquistas</h2>
        <ul className={`${card} flex flex-col divide-y divide-farol-line`}>
          {badges.map((badge) => {
            const { value, goal } = badge.progress(ctx);
            const unlocked = value >= goal;
            return (
              <li key={badge.id} className="flex items-center gap-4 p-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                    unlocked ? "border border-farol-accent/40 bg-farol-accent-soft" : "bg-farol-surface2 opacity-60 grayscale"
                  }`}
                  aria-hidden
                >
                  {badge.icon}
                </span>
                <div className="min-w-0 grow">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                    {badge.title}
                    {unlocked && <Pill tone="verde" className="px-2 py-0.5">✓ desbloqueada</Pill>}
                  </p>
                  <p className="mb-1 text-sm text-farol-muted">{badge.description}</p>
                  {!unlocked && (
                    <div className="flex items-center gap-2">
                      <ProgressBar value={value / goal} className="h-2" />
                      <span className="font-num text-xs font-extrabold tabular-nums text-farol-muted">
                        {value}/{goal}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <OfensivaCard />

      {/* Configurações */}
      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Configurações</h2>
        <div className={`${card} flex flex-col gap-4 p-4`}>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Meta diária
            <select
              className="rounded-xl border border-farol-line bg-farol-bg px-3 py-2 font-normal text-farol-ink outline-none focus:border-farol-accent"
              value={state.dailyGoal}
              onChange={(e) => state.setDailyGoal(Number(e.target.value))}
            >
              {[15, 30, 50, 80].map((g) => (
                <option key={g} value={g}>
                  {g} faíscas por dia
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-3 font-semibold">
            Efeitos sonoros
            <input type="checkbox" className="h-5 w-5 accent-farol-accent" checked={state.soundOn} onChange={state.toggleSound} />
          </label>
          <button
            className="self-start text-sm font-semibold text-farol-bad hover:underline"
            onClick={() => setConfirmReset(true)}
          >
            Reiniciar progresso
          </button>
        </div>
      </section>

      {/* Sobre o conteúdo */}
      <section id="sobre">
        <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Sobre o conteúdo</h2>
        <div className={`${card} flex items-start gap-3 p-4`}>
          <Faroldo className="h-11 w-11" />
          <div className="min-w-0 text-sm text-farol-muted">
            <p>
              A linha <strong className="text-farol-ink">{linhaAtual.title}</strong> é
              baseada no <strong className="text-farol-ink">{linhaAtual.fontes[0]}</strong>:
              cultura comercial, Vendas 360º, glossário, etapas do processo
              comercial, diagnóstico, cross e up-selling, quebra de objeções,
              follow-up, urgência, fechamento, gestão de crise e indicação.
            </p>
            <p className="mt-2">
              Onde o playbook é genérico ou silencioso (medição, versões de layout,
              “manda só a tabela”, orçamento parado), usamos {linhaAtual.fontes[1]},
              com situações do dia a dia da Open.
            </p>
            <p className="mt-2">
              É material de treino: descontos, prazos e condições citados são os
              exemplos do próprio playbook.{" "}
              <strong className="text-farol-ink">
                O gestor comercial deve revisar e ajustar o conteúdo
              </strong>{" "}
              sempre que o playbook mudar.
            </p>
          </div>
        </div>
      </section>
      {confirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/85 backdrop-blur-sm sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reset-title"
          aria-describedby="reset-desc"
          onClick={() => setConfirmReset(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border border-farol-line bg-farol-surface p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reset-title" className="font-display text-xl font-extrabold tracking-tight">
              Reiniciar todo o seu progresso?
            </h2>
            <p id="reset-desc" className="mt-2 text-farol-muted">
              Isso apaga suas faíscas, moedas, chama, lições concluídas, conquistas,
              divisão, avatar e itens comprados neste aparelho.{" "}
              <b className="text-farol-ink">Não dá para desfazer.</b>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                className={`flex-1 ${buttonBase} ${buttonVariants.danger}`}
                onClick={() => {
                  state.reset();
                  setConfirmReset(false);
                }}
              >
                Apagar tudo
              </button>
              <button
                autoFocus
                className={`flex-1 ${buttonBase} ${buttonVariants.ghost}`}
                onClick={() => setConfirmReset(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConquistasPage: NextPage = () => (
  <FarolLayout title="Conquistas">
    <Conquistas />
  </FarolLayout>
);

export default ConquistasPage;
