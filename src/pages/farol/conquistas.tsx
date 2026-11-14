import type { NextPage } from "next";
import { useState } from "react";
import { allLessons } from "~/farol/content";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { CoinIcon, HeartIcon, ShieldIcon } from "~/farol/components/Icons";
import { Button, ProgressBar } from "~/farol/components/ui";
import {
  badges,
  completedLessonCount,
  getLevel,
  levels,
} from "~/farol/gamification";
import { useStreak } from "~/farol/hooks";
import {
  MAX_HEARTS,
  MAX_STREAK_FREEZES,
  REFILL_HEARTS_COST,
  STREAK_FREEZE_COST,
  useFarolStore,
} from "~/farol/store";

const Stat = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
  <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 p-3">
    <span className="text-2xl" aria-hidden>
      {icon}
    </span>
    <div>
      <p className="text-lg font-extrabold text-[#0f2742]">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Conquistas = () => {
  const state = useFarolStore();
  const streak = useStreak();
  const [message, setMessage] = useState<string | null>(null);
  const level = getLevel(state.xpTotal);
  const ctx = { xpTotal: state.xpTotal, streak, stats: state.stats, lessons: state.lessons };
  const accuracy = state.stats.answered
    ? Math.round((state.stats.correct / state.stats.answered) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Perfil + patente */}
      <section className="rounded-3xl bg-[#0f2742] p-6 text-white">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-4xl" aria-hidden>
            {level.current.icon}
          </span>
          <div className="grow">
            <p className="text-sm uppercase tracking-wider text-amber-300">{level.current.name}</p>
            <h1 className="text-2xl font-extrabold">{state.name || "Vendedor"}</h1>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={level.progress} color="#f5a524" />
          <p className="mt-1 text-sm text-white/70">
            {state.xpTotal} XP{level.next ? ` · faltam ${level.next.minXp - state.xpTotal} para ${level.next.name}` : ""}
          </p>
        </div>
        <ol className="mt-5 flex justify-between" aria-label="Patentes">
          {levels.map((l, i) => (
            <li key={l.name} title={`${l.name} (${l.minXp} XP)`} className={`text-xl ${i <= level.index ? "" : "opacity-30 grayscale"}`}>
              {l.icon}
            </li>
          ))}
        </ol>
      </section>

      {/* Estatísticas */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold text-[#0f2742]">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon="🔥" value={streak} label="dias de sequência" />
          <Stat icon="⚡" value={state.xpTotal} label="XP total" />
          <Stat icon="📚" value={`${completedLessonCount(state.lessons)}/${allLessons.length}`} label="lições concluídas" />
          <Stat icon="🎯" value={`${accuracy}%`} label="precisão geral" />
        </div>
      </section>

      {/* Conquistas */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold text-[#0f2742]">Conquistas</h2>
        <ul className="flex flex-col divide-y-2 divide-gray-100 rounded-2xl border-2 border-gray-200">
          {badges.map((badge) => {
            const { value, goal } = badge.progress(ctx);
            const unlocked = value >= goal;
            return (
              <li key={badge.id} className="flex items-center gap-4 p-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                    unlocked ? "bg-amber-100" : "bg-gray-100 grayscale"
                  }`}
                  aria-hidden
                >
                  {badge.icon}
                </span>
                <div className="grow">
                  <p className="font-bold text-[#0f2742]">
                    {badge.title}
                    {unlocked && <span className="ml-2 text-sm text-green-500">✓ desbloqueada</span>}
                  </p>
                  <p className="mb-1 text-sm text-gray-500">{badge.description}</p>
                  {!unlocked && (
                    <div className="flex items-center gap-2">
                      <ProgressBar value={value / goal} color="#f5a524" className="h-2.5" />
                      <span className="text-xs font-bold text-gray-400">
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

      {/* Loja */}
      <section id="loja">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#0f2742]">Loja</h2>
          <span className="flex items-center gap-1 font-bold text-amber-600">
            <CoinIcon className="h-6 w-6" /> {state.coins}
          </span>
        </div>
        {message && (
          <p className="mb-3 rounded-xl bg-green-50 px-4 py-2 font-bold text-green-700" role="status">
            {message}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 p-4">
            <HeartIcon className="h-12 w-12 shrink-0" />
            <div className="grow">
              <p className="font-bold text-[#0f2742]">Recarregar vidas</p>
              <p className="text-sm text-gray-500">
                Volte a {MAX_HEARTS} vidas agora. Você tem {state.hearts}.
              </p>
            </div>
            <Button
              className="flex items-center gap-1 px-4 py-2 text-sm"
              disabled={state.hearts >= MAX_HEARTS || state.coins < REFILL_HEARTS_COST}
              onClick={() => state.refillHearts() && setMessage("Vidas recarregadas! ❤️")}
            >
              <CoinIcon className="h-4 w-4" /> {REFILL_HEARTS_COST}
            </Button>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 p-4">
            <ShieldIcon className="h-12 w-12 shrink-0" />
            <div className="grow">
              <p className="font-bold text-[#0f2742]">Protetor de sequência</p>
              <p className="text-sm text-gray-500">
                Protege sua sequência se você ficar um dia sem treinar. Equipados: {state.streakFreezes}/{MAX_STREAK_FREEZES}.
              </p>
            </div>
            <Button
              className="flex items-center gap-1 px-4 py-2 text-sm"
              disabled={state.streakFreezes >= MAX_STREAK_FREEZES || state.coins < STREAK_FREEZE_COST}
              onClick={() => state.buyStreakFreeze() && setMessage("Protetor de sequência equipado! 🛡️")}
            >
              <CoinIcon className="h-4 w-4" /> {STREAK_FREEZE_COST}
            </Button>
          </div>
        </div>
      </section>

      {/* Configurações */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold text-[#0f2742]">Configurações</h2>
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 p-4">
          <label className="flex items-center justify-between font-bold text-gray-600">
            Meta diária
            <select
              className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2"
              value={state.dailyGoal}
              onChange={(e) => state.setDailyGoal(Number(e.target.value))}
            >
              {[15, 30, 50, 80].map((g) => (
                <option key={g} value={g}>
                  {g} XP por dia
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between font-bold text-gray-600">
            Efeitos sonoros
            <input type="checkbox" className="h-5 w-5 accent-amber-500" checked={state.soundOn} onChange={state.toggleSound} />
          </label>
          <button
            className="self-start text-sm font-bold text-rose-500 hover:underline"
            onClick={() => {
              if (window.confirm("Apagar todo o seu progresso no Farol?")) state.reset();
            }}
          >
            Reiniciar progresso
          </button>
        </div>
      </section>
    </div>
  );
};

const ConquistasPage: NextPage = () => (
  <FarolLayout title="Conquistas">
    <Conquistas />
  </FarolLayout>
);

export default ConquistasPage;
