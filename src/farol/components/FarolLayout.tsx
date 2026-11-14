import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";
import { getLevel } from "../gamification";
import { useHeartRegen, useHydrated, useStreak } from "../hooks";
import { MAX_HEARTS, useFarolStore, xpOn, xpThisWeek } from "../store";
import dayjs from "dayjs";
import {
  CoinIcon,
  FlameIcon,
  HeartIcon,
  LighthouseLogo,
  MapIcon,
  MedalIcon,
  PodiumIcon,
  XpIcon,
} from "./Icons";
import { ProgressBar } from "./ui";

const navItems = [
  { href: "/farol", label: "Trilha", Icon: MapIcon },
  { href: "/farol/ranking", label: "Ranking", Icon: PodiumIcon },
  { href: "/farol/conquistas", label: "Conquistas", Icon: MedalIcon },
];

export const StatsRow = () => {
  const streak = useStreak();
  const coins = useFarolStore((s) => s.coins);
  const hearts = useFarolStore((s) => s.hearts);
  const practicedToday = useFarolStore((s) =>
    s.activeDays.includes(dayjs().format("YYYY-MM-DD")),
  );
  return (
    <div className="flex items-center justify-between gap-4 font-bold">
      <span
        className="flex items-center gap-1.5 text-orange-500"
        title="Sequência de dias praticando"
      >
        <FlameIcon className="h-7 w-7" off={!practicedToday} />
        <span className={practicedToday ? "" : "text-gray-400"}>{streak}</span>
      </span>
      <span className="flex items-center gap-1.5 text-amber-500" title="Moedas">
        <CoinIcon className="h-7 w-7" />
        {coins}
      </span>
      <span className="flex items-center gap-1.5 text-rose-500" title="Vidas">
        <HeartIcon className="h-7 w-7" empty={hearts === 0} />
        {hearts}
        <span className="sr-only">de {MAX_HEARTS}</span>
      </span>
    </div>
  );
};

const DailyGoalCard = () => {
  const dailyGoal = useFarolStore((s) => s.dailyGoal);
  const xpToday = useFarolStore((s) => xpOn(s.xpByDate, dayjs()));
  const done = xpToday >= dailyGoal;
  return (
    <section className="rounded-2xl border-2 border-gray-200 p-5">
      <h2 className="mb-3 text-lg font-bold text-[#0f2742]">Meta diária</h2>
      <div className="flex items-center gap-3">
        <XpIcon className="h-9 w-9 shrink-0" />
        <div className="grow">
          <ProgressBar value={xpToday / dailyGoal} color={done ? "#22c55e" : "#f5a524"} />
          <p className="mt-1 text-sm text-gray-500">
            {done ? "Meta batida! 🎉" : `${xpToday} / ${dailyGoal} XP hoje`}
          </p>
        </div>
      </div>
    </section>
  );
};

const LevelCard = () => {
  const xpTotal = useFarolStore((s) => s.xpTotal);
  const { current, next, progress } = getLevel(xpTotal);
  return (
    <section className="rounded-2xl border-2 border-gray-200 p-5">
      <h2 className="mb-3 text-lg font-bold text-[#0f2742]">Sua patente</h2>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {current.icon}
        </span>
        <div className="grow">
          <p className="font-bold">{current.name}</p>
          <ProgressBar value={progress} color="#0f2742" />
          <p className="mt-1 text-sm text-gray-500">
            {next
              ? `${next.minXp - xpTotal} XP para ${next.name}`
              : "Patente máxima alcançada!"}
          </p>
        </div>
      </div>
    </section>
  );
};

const LeagueTeaser = () => {
  const weekXp = useFarolStore((s) => xpThisWeek(s.xpByDate));
  return (
    <section className="rounded-2xl border-2 border-gray-200 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0f2742]">Liga do time</h2>
        <Link href="/farol/ranking" className="text-sm font-bold uppercase text-sky-500 hover:brightness-110">
          Ver
        </Link>
      </div>
      <p className="text-sm text-gray-500">
        Você fez <strong className="text-[#0f2742]">{weekXp} XP</strong> esta
        semana. Os 3 primeiros sobem de liga no domingo.
      </p>
    </section>
  );
};

const Onboarding = () => {
  const completeOnboarding = useFarolStore((s) => s.completeOnboarding);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(30);
  const goals = [
    { xp: 15, label: "Leve", desc: "1 lição por dia" },
    { xp: 30, label: "Regular", desc: "2 lições por dia" },
    { xp: 50, label: "Intenso", desc: "3 lições por dia" },
    { xp: 80, label: "Closer", desc: "5 lições por dia" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2742]/80 p-4">
      <form
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          completeOnboarding(name || "Vendedor", goal);
        }}
      >
        <LighthouseLogo className="mx-auto h-20 w-20" />
        <h1 className="mt-2 text-center text-2xl font-extrabold text-[#0f2742]">
          Bem-vindo ao Farol Vendas
        </h1>
        <p className="mt-1 text-center text-gray-500">
          Treino de vendas em lições de 3 minutos. Ganhe XP, mantenha a
          sequência e suba no ranking do time.
        </p>
        <label className="mt-5 block text-sm font-bold text-gray-600">
          Como você quer ser chamado?
          <input
            className="mt-1 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-normal outline-none focus:border-sky-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            maxLength={30}
            autoFocus
          />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm font-bold text-gray-600">Meta diária</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {goals.map((g) => (
              <button
                type="button"
                key={g.xp}
                onClick={() => setGoal(g.xp)}
                className={`rounded-xl border-2 border-b-4 px-3 py-2 text-left transition ${
                  goal === g.xp
                    ? "border-sky-400 bg-sky-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="block font-bold">
                  {g.label} · {g.xp} XP
                </span>
                <span className="text-sm text-gray-500">{g.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="mt-6 w-full rounded-2xl border-b-4 border-[#c7811a] bg-[#f5a524] py-3 font-extrabold uppercase tracking-wide text-white transition hover:brightness-105 active:translate-y-0.5 active:border-b-2"
        >
          Começar a treinar
        </button>
      </form>
    </div>
  );
};

export const FarolLayout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useFarolStore((s) => s.onboarded);
  useHeartRegen();

  return (
    <>
      <Head>
        <title>{`${title} · Farol Vendas`}</title>
        <meta name="theme-color" content="#0f2742" />
      </Head>

      {/* Barra lateral (desktop) */}
      <nav className="fixed bottom-0 left-0 top-0 z-20 hidden flex-col gap-2 border-r-2 border-gray-200 bg-white p-3 md:flex lg:w-60 lg:p-5">
        <Link href="/farol" className="mb-6 mt-2 flex items-center gap-2 px-2">
          <LighthouseLogo className="h-10 w-10 shrink-0" />
          <span className="hidden text-2xl font-extrabold leading-none text-[#0f2742] lg:block">
            farol
            <span className="block text-sm font-bold uppercase tracking-widest text-[#f5a524]">
              vendas
            </span>
          </span>
        </Link>
        {navItems.map(({ href, label, Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-bold uppercase tracking-wide transition ${
                active
                  ? "border-amber-300 bg-amber-50 text-[#c7811a]"
                  : "border-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-7 w-7" />
              <span className="sr-only lg:not-sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Topo (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b-2 border-gray-200 bg-white px-4 py-3 md:hidden">
        <LighthouseLogo className="h-9 w-9" />
        <div className="w-56">{hydrated && <StatsRow />}</div>
      </header>

      <div className="flex justify-center gap-12 pb-28 pt-6 md:ml-24 md:px-6 md:pb-10 lg:ml-60">
        <main className="w-full max-w-xl px-4 md:px-0">
          {hydrated ? children : <div className="h-96" />}
        </main>
        <aside className="sticky top-6 hidden h-fit w-80 shrink-0 flex-col gap-4 lg:flex">
          {hydrated && (
            <>
              <div className="px-2 py-1">
                <StatsRow />
              </div>
              <DailyGoalCard />
              <LevelCard />
              <LeagueTeaser />
            </>
          )}
        </aside>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t-2 border-gray-200 bg-white py-2 md:hidden">
        {navItems.map(({ href, label, Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center rounded-xl px-4 py-1 text-xs font-bold ${
                active ? "text-[#c7811a]" : "text-gray-400"
              }`}
            >
              <Icon className="h-7 w-7" />
              {label}
            </Link>
          );
        })}
      </nav>

      {hydrated && !onboarded && <Onboarding />}
    </>
  );
};
