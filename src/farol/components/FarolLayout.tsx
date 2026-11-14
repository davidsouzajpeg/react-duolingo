import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useState } from "react";
import { getLevel } from "../gamification";
import {
  useDailySync,
  useGestorNoticeRetry,
  useHydrated,
  useStreak,
} from "../hooks";
import { divisions } from "../gamification";
import { randomAvatar } from "../shop";
import { Avatar } from "./Avatar";
import { OfensivaCard } from "./Ofensiva";
import { useFarolStore, xpOn, xpThisWeek } from "../store";
import dayjs from "dayjs";
import {
  CoinIcon,
  FlameIcon,
  MapIcon,
  MedalIcon,
  PodiumIcon,
  StarIcon,
  XpIcon,
} from "./Icons";
import {
  Brand,
  Eyebrow,
  FarolShell,
  Faroldo,
  Feixe,
  ProgressBar,
  buttonBase,
  buttonVariants,
  card,
} from "./ui";

const navItems = [
  { href: "/farol", label: "Trilha", Icon: MapIcon },
  { href: "/farol/ranking", label: "Divisões", Icon: PodiumIcon },
  { href: "/farol/loja", label: "Loja", Icon: StarIcon },
  { href: "/farol/conquistas", label: "Perfil", Icon: MedalIcon },
];

export const StatsRow = () => {
  const streak = useStreak();
  const coins = useFarolStore((s) => s.coins);
  const practicedToday = useFarolStore((s) =>
    s.activeDays.includes(dayjs().format("YYYY-MM-DD")),
  );
  return (
    <div className="flex items-center justify-around gap-4 font-num text-lg font-extrabold tabular-nums">
      <span
        className={`flex items-center gap-1.5 ${practicedToday ? "text-farol-warn" : "text-farol-muted"}`}
        title="Ofensiva: dias seguidos praticando"
      >
        <FlameIcon className="h-7 w-7" off={!practicedToday} />
        {streak}
      </span>
      <span className="flex items-center gap-1.5 text-farol-warn" title="Moedas">
        <CoinIcon className="h-7 w-7" />
        {coins}
      </span>
    </div>
  );
};

const DailyGoalCard = () => {
  const dailyGoal = useFarolStore((s) => s.dailyGoal);
  const xpToday = useFarolStore((s) => xpOn(s.xpByDate, dayjs()));
  const done = xpToday >= dailyGoal;
  return (
    <section className={`${card} p-5`}>
      <Eyebrow>Meta diária</Eyebrow>
      <div className="mt-3 flex items-center gap-3">
        <XpIcon className="h-9 w-9 shrink-0" />
        <div className="grow">
          <ProgressBar value={xpToday / dailyGoal} color={done ? "#3fcf86" : "#ff0084"} />
          <p className="mt-1.5 text-sm text-farol-muted">
            {done ? (
              <span className="font-semibold text-farol-ok">Meta batida! 🎉</span>
            ) : (
              <>
                <b className="font-num font-extrabold tabular-nums text-farol-ink">{xpToday}</b> / {dailyGoal} XP hoje
              </>
            )}
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
    <section className={`${card} p-5`}>
      <Eyebrow>Seu nível</Eyebrow>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-farol-surface2 text-2xl" aria-hidden>
          {current.icon}
        </span>
        <div className="grow">
          <p className="font-display font-extrabold tracking-tight">{current.name}</p>
          <ProgressBar value={progress} className="mt-1 h-2.5" />
          <p className="mt-1.5 text-sm text-farol-muted">
            {next
              ? `${next.minXp - xpTotal} XP para ${next.name}`
              : "Nível máximo alcançado!"}
          </p>
        </div>
      </div>
    </section>
  );
};

const LeagueTeaser = () => {
  const weekXp = useFarolStore((s) => xpThisWeek(s.xpByDate));
  const tier = useFarolStore((s) => s.league.tier);
  return (
    <section className={`${card} p-5`}>
      <div className="mb-2 flex items-center justify-between">
        <Eyebrow>Divisão {divisions[tier]!.name}</Eyebrow>
        <Link href="/farol/ranking" className="text-xs font-semibold uppercase tracking-[.09em] text-farol-accent hover:underline">
          Ver divisão
        </Link>
      </div>
      <p className="text-sm text-farol-muted">
        Você fez{" "}
        <strong className="font-num font-extrabold tabular-nums text-farol-ink">{weekXp} XP</strong>{" "}
        esta semana. No domingo, os 3 primeiros sobem e os 3 últimos descem.
      </p>
    </section>
  );
};

const Onboarding = () => {
  const completeOnboarding = useFarolStore((s) => s.completeOnboarding);
  const avatar = useFarolStore((s) => s.avatar);
  const setAvatar = useFarolStore((s) => s.setAvatar);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(30);
  const goals = [
    { xp: 15, label: "Leve", desc: "1 lição por dia" },
    { xp: 30, label: "Regular", desc: "2 lições por dia" },
    { xp: 50, label: "Intenso", desc: "3 lições por dia" },
    { xp: 80, label: "Farol aceso", desc: "5 lições por dia" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-farol-lamp/85 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-farol-line bg-farol-surface p-6 shadow-2xl sm:rounded-3xl"
        onSubmit={(e) => {
          e.preventDefault();
          completeOnboarding(name || "Consultor", goal);
        }}
      >
        <Feixe className="-right-32 -top-32 h-80 w-80" />
        <div className="relative">
          <Brand />
          <div className="mt-6 flex items-start gap-3">
            <Faroldo className="h-14 w-14" mood="feliz" />
            <div>
              <Eyebrow className="text-farol-accent">Faroldo diz</Eyebrow>
              <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">
                Bora vendê?
              </h1>
            </div>
          </div>
          <p className="mt-3 text-farol-muted">
            Vender se aprende. Um pouco por dia, em lições de 3 minutos com
            situações reais de fachadas, letreiros e sinalização. Acompanhe a
            sua evolução e comemore cada conquista.
          </p>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">
            Como você quer ser chamado?
            <input
              className="mt-2 w-full rounded-xl border border-farol-line bg-farol-bg px-4 py-3 text-base font-normal normal-case tracking-normal text-farol-ink outline-none placeholder:text-farol-muted/60 focus:border-farol-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              maxLength={30}
              autoFocus
            />
          </label>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-farol-line bg-farol-bg p-3">
            <Avatar config={avatar} className="h-16 w-16 rounded-full" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Este é o seu avatar</p>
              <p className="text-sm text-farol-muted">Depois você muda tudo na Loja.</p>
              <button
                type="button"
                onClick={() => setAvatar(randomAvatar())}
                className="mt-1 text-xs font-semibold uppercase tracking-[.09em] text-farol-accent hover:brightness-125"
              >
                Sortear outro
              </button>
            </div>
          </div>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-[.09em] text-farol-muted">
              Meta diária
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button
                  type="button"
                  key={g.xp}
                  onClick={() => setGoal(g.xp)}
                  aria-pressed={goal === g.xp}
                  className={`rounded-xl border border-b-4 px-3 py-2 text-left transition ${
                    goal === g.xp
                      ? "border-farol-accent bg-farol-accent-soft"
                      : "border-farol-line bg-farol-bg hover:bg-farol-surface2"
                  }`}
                >
                  <span className="block font-semibold">
                    {g.label} ·{" "}
                    <span className="font-num font-extrabold tabular-nums">{g.xp} XP</span>
                  </span>
                  <span className="text-sm text-farol-muted">{g.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className={`mt-6 w-full ${buttonBase} ${buttonVariants.primary}`}
          >
            Bora vendê!
          </button>
        </div>
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
  useGestorNoticeRetry();
  useDailySync();

  return (
    <FarolShell title={title}>
      {/* Barra lateral (desktop) */}
      <nav className="fixed bottom-0 left-0 top-0 z-20 hidden w-20 flex-col gap-1 border-r border-farol-line bg-farol-surface p-3 md:flex lg:w-60 lg:p-5">
        <Link href="/farol" className="mb-8 mt-2 px-1" aria-label="Vendê">
          <span className="hidden lg:block">
            <Brand />
          </span>
          <b className="block text-center font-display text-2xl font-extrabold lowercase lg:hidden">
            v<span className="text-farol-accent">.</span>
          </b>
        </Link>
        {navItems.map(({ href, label, Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold uppercase tracking-[.09em] transition lg:justify-start ${
                active
                  ? "border-farol-accent/50 bg-farol-accent-soft text-farol-accent"
                  : "border-transparent text-farol-muted hover:bg-farol-surface2 hover:text-farol-ink"
              }`}
            >
              <Icon className="h-7 w-7 shrink-0" />
              <span className="sr-only lg:not-sr-only">{label}</span>
            </Link>
          );
        })}
        <div className="mt-auto hidden px-2 lg:block">
          <p className="font-display text-sm font-extrabold tracking-tight">
            Vender se aprende.
          </p>
          <p className="mt-0.5 text-xs text-farol-muted">Linha Venda Consultiva</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/farol/logo-open.png" alt="Open" className="mt-4 h-5 w-auto opacity-80" />
        </div>
      </nav>

      {/* Topo (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-farol-line bg-farol-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/farol" aria-label="Vendê">
          <Brand compact />
        </Link>
        <div className="w-32 shrink-0">{hydrated && <StatsRow />}</div>
      </header>

      <div className="flex justify-center gap-10 pb-28 pt-6 md:ml-20 md:px-6 md:pb-10 lg:ml-60">
        <main className="w-full min-w-0 max-w-xl px-4 md:px-0">
          {hydrated ? children : <div className="h-96" />}
        </main>
        <aside className="sticky top-6 hidden h-fit w-80 shrink-0 flex-col gap-4 xl:flex">
          {hydrated && (
            <>
              <div className={`${card} px-5 py-3`}>
                <StatsRow />
              </div>
              <OfensivaCard />
              <DailyGoalCard />
              <LeagueTeaser />
              <LevelCard />
            </>
          )}
        </aside>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-farol-line bg-farol-surface pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {navItems.map(({ href, label, Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center border-t-2 px-2 pt-1 text-xs font-semibold ${
                active
                  ? "-mt-2 border-farol-accent pt-3 text-farol-accent"
                  : "border-transparent text-farol-muted"
              }`}
            >
              <Icon className="h-7 w-7" />
              {label}
            </Link>
          );
        })}
      </nav>

      {hydrated && !onboarded && <Onboarding />}
    </FarolShell>
  );
};
