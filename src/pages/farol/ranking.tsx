import dayjs from "dayjs";
import type { NextPage } from "next";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { XpIcon } from "~/farol/components/Icons";
import {
  DEMOTION_SPOTS,
  PROMOTION_SPOTS,
  buildLeague,
} from "~/farol/gamification";
import { useFarolStore, xpThisWeek } from "~/farol/store";

const medal = ["🥇", "🥈", "🥉"];

const avatarColor = (name: string) => {
  const colors = ["#f5a524", "#14b8a6", "#3b82f6", "#f43f5e", "#8b5cf6", "#22c55e", "#0ea5e9"];
  let h = 0;
  for (const c of name) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h]!;
};

const Ranking = () => {
  const name = useFarolStore((s) => s.name);
  const weekXp = useFarolStore((s) => xpThisWeek(s.xpByDate));
  const league = buildLeague(name, weekXp);
  const myPosition = league.findIndex((e) => e.isMe) + 1;
  const daysLeft = 7 - ((dayjs().day() + 6) % 7);

  return (
    <>
      <header className="mb-6 text-center">
        <div className="text-6xl" aria-hidden>
          🛟
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-[#0f2742]">
          Liga Farol · Bronze
        </h1>
        <p className="text-gray-500">
          Os {PROMOTION_SPOTS} primeiros sobem para a Liga Prata.{" "}
          <strong className="text-[#c7811a]">
            {daysLeft === 1 ? "Termina hoje" : `Faltam ${daysLeft} dias`}
          </strong>
        </p>
        <p className="mt-3 inline-block rounded-full bg-amber-50 px-4 py-1 font-bold text-[#c7811a]">
          Você está em {myPosition}º lugar
        </p>
      </header>

      <ol className="flex flex-col">
        {league.map((entry, i) => {
          const position = i + 1;
          const promoted = position <= PROMOTION_SPOTS;
          const demoted = position > league.length - DEMOTION_SPOTS;
          return (
            <li key={entry.name + i}>
              {position === PROMOTION_SPOTS + 1 && (
                <p className="my-2 text-center text-xs font-extrabold uppercase tracking-wider text-green-500">
                  ▲ Zona de promoção ▲
                </p>
              )}
              {position === league.length - DEMOTION_SPOTS + 1 && (
                <p className="my-2 text-center text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  ▼ Zona de rebaixamento ▼
                </p>
              )}
              <div
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
                  entry.isMe ? "bg-amber-50 ring-2 ring-amber-300" : ""
                }`}
              >
                <span
                  className={`w-7 text-center font-extrabold ${
                    promoted ? "text-green-500" : demoted ? "text-rose-400" : "text-gray-400"
                  }`}
                >
                  {medal[i] ?? position}
                </span>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white"
                  style={{ backgroundColor: entry.isMe ? "#0f2742" : avatarColor(entry.name) }}
                  aria-hidden
                >
                  {entry.name.charAt(0).toUpperCase()}
                </span>
                <span className="grow font-bold text-[#0f2742]">
                  {entry.name}
                  {entry.isMe && <span className="ml-2 text-sm font-normal text-gray-400">(você)</span>}
                </span>
                <span className="flex items-center gap-1 font-bold text-gray-500">
                  <XpIcon className="h-5 w-5" />
                  {entry.xp} XP
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-center text-sm text-gray-400">
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
