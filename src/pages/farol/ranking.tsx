import dayjs from "dayjs";
import type { NextPage } from "next";
import { Avatar } from "~/farol/components/Avatar";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { CoinIcon, XpIcon } from "~/farol/components/Icons";
import { Button, Eyebrow, Feixe, Pill, card } from "~/farol/components/ui";
import {
  DEMOTION_SPOTS,
  PROMOTION_SPOTS,
  TOP_DIVISION,
  buildLeague,
  divisions,
  zoneOf,
} from "~/farol/gamification";
import { useFarolStore, xpThisWeek } from "~/farol/store";

const medal = ["🥇", "🥈", "🥉"];

/** Escudo da divisão */
const DivisionBadge = ({
  tier,
  className = "h-10 w-10",
  dim = false,
}: {
  tier: number;
  className?: string;
  dim?: boolean;
}) => {
  const d = divisions[tier]!;
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className} ${dim ? "opacity-30" : ""}`} role="img" aria-label={`Divisão ${d.name}`}>
      <path d="M24 3 42 9v14c0 11-7.5 18.5-18 22C13.5 41.5 6 34 6 23V9Z" fill={d.color} />
      <path d="M24 8l13.5 4.5V23c0 8.5-5.5 14.2-13.5 17.2Z" fill="#000" opacity=".16" />
      <text x="24" y="29" textAnchor="middle" fontSize="16" fontWeight="900" fill="#121317" fontFamily="Nunito, system-ui, sans-serif">
        {tier + 1}
      </text>
    </svg>
  );
};

/** Aviso do resultado da semana que acabou de fechar */
const WeekResult = () => {
  const result = useFarolStore((s) => s.league.lastResult);
  const markSeen = useFarolStore((s) => s.markLeagueResultSeen);
  if (!result || result.seen) return null;
  const to = divisions[result.toTier]!;
  const title =
    result.outcome === "subiu"
      ? `Você subiu para a Divisão ${to.name}!`
      : result.outcome === "caiu"
        ? `Você desceu para a Divisão ${to.name}`
        : `Você permanece na Divisão ${to.name}`;
  const text =
    result.outcome === "subiu"
      ? "Semana excelente. A concorrência fica mais forte daqui para cima."
      : result.outcome === "caiu"
        ? "Semana nova, chance nova: algumas lições já colocam você de volta na disputa."
        : result.position <= 6
          ? "Faltou pouco para subir. Bora vendê nesta semana?"
          : "Você manteve o seu lugar. Bora vendê nesta semana?";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/85 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Resultado da semana">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-farol-line bg-farol-surface p-6 text-center sm:rounded-3xl">
        <Feixe />
        <div className="relative flex flex-col items-center gap-3">
          <Eyebrow className="text-farol-accent">Resultado da semana</Eyebrow>
          <DivisionBadge tier={result.toTier} className="h-24 w-24" />
          <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight">{title}</h2>
          <p className="text-farol-muted">
            Você terminou em{" "}
            <b className="font-num font-extrabold tabular-nums text-farol-ink">{result.position}º lugar</b> com{" "}
            <b className="font-num font-extrabold tabular-nums text-farol-ink">{result.xp} faíscas</b>. {text}
          </p>
          {result.coins > 0 && (
            <p className="flex items-center gap-1.5 rounded-full bg-farol-warn-soft px-4 py-1.5 font-num font-extrabold tabular-nums text-farol-warn">
              <CoinIcon className="h-5 w-5" /> +{result.coins} moedas
            </p>
          )}
          <Button className="mt-2 w-full" onClick={markSeen}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

const Ranking = () => {
  const name = useFarolStore((s) => s.name);
  const avatar = useFarolStore((s) => s.avatar);
  const tier = useFarolStore((s) => s.league.tier);
  const weekXp = useFarolStore((s) => xpThisWeek(s.xpByDate));
  const league = buildLeague(name, weekXp, tier);
  const myPosition = league.findIndex((e) => e.isMe) + 1;
  const daysLeft = 7 - ((dayjs().day() + 6) % 7);
  const myZone = zoneOf(myPosition, league.length, tier);
  const division = divisions[tier]!;
  const canPromote = tier < TOP_DIVISION;
  const canDemote = tier > 0;

  return (
    <>
      <header className={`${card} relative mb-6 overflow-hidden p-5 sm:p-6`}>
        <Feixe />
        <div className="relative">
          <Eyebrow className="text-farol-accent">Divisões · semana atual</Eyebrow>
          <div className="mt-2 flex items-center gap-3">
            <DivisionBadge tier={tier} className="h-14 w-14" />
            <h1 className="font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
              Divisão {division.name}
            </h1>
          </div>

          <ol className="mt-4 flex items-center justify-between gap-1" aria-label="Todas as divisões">
            {divisions.map((d, i) => (
              <li key={d.name} className="flex flex-col items-center gap-1">
                <DivisionBadge tier={i} className={i === tier ? "h-10 w-10" : "h-8 w-8"} dim={i > tier} />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${i === tier ? "text-farol-ink" : "text-farol-muted"}`}>
                  {d.name}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-sm text-farol-muted">
            {canPromote
              ? `Os ${PROMOTION_SPOTS} primeiros sobem de divisão. `
              : "Você está na divisão mais alta. "}
            {canDemote
              ? `Os ${DEMOTION_SPOTS} últimos descem. `
              : "Nesta divisão ninguém desce. "}
            <strong className="text-farol-ink">
              {daysLeft === 1 ? "Termina hoje." : `Faltam ${daysLeft} dias.`}
            </strong>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={myZone === "subiu" ? "verde" : myZone === "caiu" ? "vermelho" : "neutro"} className="text-sm">
              <b className="font-num font-extrabold tabular-nums">{myPosition}º</b> lugar ·{" "}
              {myZone === "subiu" ? "subindo" : myZone === "caiu" ? "zona de descida" : "permanece"}
            </Pill>
            <Pill tone="rosa" className="text-sm">
              <b className="font-num font-extrabold tabular-nums">{weekXp} faíscas</b> na semana
            </Pill>
          </div>
        </div>
      </header>

      <ol className={`${card} flex flex-col overflow-hidden`}>
        {league.map((entry, i) => {
          const position = i + 1;
          const zone = zoneOf(position, league.length, tier);
          return (
            <li key={entry.name + i} className="border-b border-farol-line last:border-b-0">
              {canPromote && position === PROMOTION_SPOTS + 1 && (
                <p className="border-b border-farol-line bg-farol-ok-soft py-1.5 text-center text-xs font-semibold uppercase tracking-[.09em] text-farol-ok">
                  ▲ Zona de subida ▲
                </p>
              )}
              {canDemote && position === league.length - DEMOTION_SPOTS + 1 && (
                <p className="border-b border-farol-line bg-farol-bad-soft py-1.5 text-center text-xs font-semibold uppercase tracking-[.09em] text-farol-bad">
                  ▼ Zona de descida ▼
                </p>
              )}
              <div
                className={`flex items-center gap-3 px-4 py-3 sm:gap-4 ${
                  entry.isMe ? "bg-farol-accent-soft shadow-[inset_3px_0_0_#ff0084]" : ""
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-center font-num text-lg font-black tabular-nums ${
                    zone === "subiu" ? "text-farol-ok" : zone === "caiu" ? "text-farol-bad" : "text-farol-muted"
                  }`}
                >
                  {medal[i] ?? position}
                </span>
                {entry.isMe ? (
                  <Avatar config={avatar} className="h-10 w-10 rounded-full border-2 border-farol-accent" />
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-farol-line bg-farol-surface2 font-display text-base font-extrabold text-farol-muted"
                    aria-hidden
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 grow truncate font-semibold">
                  {entry.name}
                  {entry.isMe && <span className="ml-2 text-sm font-normal text-farol-muted">(você)</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1 font-num font-extrabold tabular-nums">
                  <XpIcon className="h-5 w-5" />
                  {entry.xp}
                  <span className="font-body text-sm font-normal text-farol-muted">faíscas</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-center text-sm text-farol-muted">
        Divisão de demonstração: os colegas são simulados até o Vendê ser ligado ao servidor do time.
      </p>
      <WeekResult />
    </>
  );
};

const RankingPage: NextPage = () => (
  <FarolLayout title="Divisões">
    <Ranking />
  </FarolLayout>
);

export default RankingPage;
