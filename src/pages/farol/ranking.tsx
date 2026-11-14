import dayjs from "dayjs";
import type { NextPage } from "next";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { XpIcon } from "~/farol/components/Icons";
import { Eyebrow, Feixe, Pill, card } from "~/farol/components/ui";
import {
  PROMOTION_SPOTS,
  buildLeague,
} from "~/farol/gamification";
import { useFarolStore, xpThisWeek } from "~/farol/store";

const medal = ["🥇", "🥈", "🥉"];

const Ranking = () => {
  const name = useFarolStore((s) => s.name);
  const weekXp = useFarolStore((s) => xpThisWeek(s.xpByDate));
  const league = buildLeague(name, weekXp);
  const myPosition = league.findIndex((e) => e.isMe) + 1;
  const daysLeft = 7 - ((dayjs().day() + 6) % 7);
  const myZone = myPosition <= PROMOTION_SPOTS ? "verde" : "neutro";

  return (
    <>
      <header className={`${card} relative mb-6 overflow-hidden p-5 sm:p-6`}>
        <Feixe />
        <div className="relative">
          <Eyebrow className="text-farol-accent">Ranking da semana</Eyebrow>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            Liga Farol · Bronze
          </h1>
          <p className="mt-2 text-sm text-farol-muted">
            Cada prática conta. Os {PROMOTION_SPOTS} primeiros da semana sobem para a Liga Prata.{" "}
            <strong className="text-farol-ink">
              {daysLeft === 1 ? "Termina hoje." : `Faltam ${daysLeft} dias.`}
            </strong>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill tone={myZone} className="text-sm">
              Você está em{" "}
              <b className="font-num font-extrabold tabular-nums">{myPosition}º</b> lugar
            </Pill>
            <Pill tone="rosa" className="text-sm">
              <b className="font-num font-extrabold tabular-nums">{weekXp} XP</b> na semana
            </Pill>
          </div>
        </div>
      </header>

      <ol className={`${card} flex flex-col overflow-hidden`}>
        {league.map((entry, i) => {
          const position = i + 1;
          const promoted = position <= PROMOTION_SPOTS;
          return (
            <li key={entry.name + i} className="border-b border-farol-line last:border-b-0">
              {position === PROMOTION_SPOTS + 1 && (
                <p className="border-b border-farol-line bg-farol-ok-soft py-1.5 text-center text-xs font-semibold uppercase tracking-[.09em] text-farol-ok">
                  ▲ Zona de promoção ▲
                </p>
              )}
              <div
                className={`flex items-center gap-3 px-4 py-3 sm:gap-4 ${
                  entry.isMe ? "bg-farol-accent-soft shadow-[inset_3px_0_0_#ff0084]" : ""
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-center font-num text-lg font-black tabular-nums ${
                    promoted ? "text-farol-ok" : "text-farol-muted"
                  }`}
                >
                  {medal[i] ?? position}
                </span>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base font-extrabold ${
                    entry.isMe
                      ? "bg-farol-accent text-white"
                      : "border border-farol-line bg-farol-surface2 text-farol-muted"
                  }`}
                  aria-hidden
                >
                  {entry.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 grow truncate font-semibold">
                  {entry.name}
                  {entry.isMe && <span className="ml-2 text-sm font-normal text-farol-muted">(você)</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1 font-num font-extrabold tabular-nums">
                  <XpIcon className="h-5 w-5" />
                  {entry.xp}
                  <span className="font-body text-sm font-normal text-farol-muted">XP</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-center text-sm text-farol-muted">
        Ranking de demonstração com colegas simulados.
      </p>
    </>
  );
};

const RankingPage: NextPage = () => (
  <FarolLayout title="Ranking">
    <Ranking />
  </FarolLayout>
);

export default RankingPage;
