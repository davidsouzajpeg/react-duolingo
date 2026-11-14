import dayjs from "dayjs";
import Link from "next/link";
import { useStreak } from "../hooks";
import { MAX_STREAK_FREEZES, useFarolStore } from "../store";
import { FlameIcon, ShieldIcon } from "./Icons";
import { Eyebrow, card } from "./ui";

const letters = ["S", "T", "Q", "Q", "S", "S", "D"];

/** Ofensiva: dias seguidos de prática, a semana atual e os bloqueios equipados */
export const OfensivaCard = ({ showShopLink = true }: { showShopLink?: boolean }) => {
  const streak = useStreak();
  const activeDays = useFarolStore((s) => s.activeDays);
  const frozenDays = useFarolStore((s) => s.frozenDays);
  const bestStreak = useFarolStore((s) => s.bestStreak);
  const freezes = useFarolStore((s) => s.streakFreezes);

  const today = dayjs();
  const monday = today.subtract((today.day() + 6) % 7, "day");
  const week = letters.map((letter, i) => {
    const date = monday.add(i, "day");
    const key = date.format("YYYY-MM-DD");
    const state = activeDays.includes(key)
      ? "feito"
      : frozenDays.includes(key)
        ? "bloqueio"
        : date.isSame(today, "day")
          ? "hoje"
          : date.isAfter(today, "day")
            ? "futuro"
            : "perdido";
    return { letter, key, state };
  });
  const practicedToday = activeDays.includes(today.format("YYYY-MM-DD"));

  return (
    <section className={`${card} p-5`} aria-label="Chama">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Eyebrow>Chama</Eyebrow>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className={`font-num text-3xl font-black tabular-nums leading-none ${practicedToday ? "text-farol-warn" : "text-farol-ink"}`}>
              {streak}
            </span>
            <span className="text-sm text-farol-muted">{streak === 1 ? "dia" : "dias"} de chama acesa</span>
          </p>
        </div>
        <FlameIcon className="h-12 w-12" off={!practicedToday} />
      </div>

      <ol className="mt-4 flex justify-between gap-1">
        {week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${d.state === "hoje" ? "text-farol-accent" : "text-farol-muted"}`}>
              {d.letter}
            </span>
            <span
              title={
                d.state === "feito"
                  ? "Praticou"
                  : d.state === "bloqueio"
                    ? "Salvo pelo protetor de chama"
                    : d.state === "perdido"
                      ? "Sem prática"
                      : ""
              }
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                d.state === "feito"
                  ? "border-farol-warn bg-farol-warn-soft"
                  : d.state === "bloqueio"
                    ? "border-sky-400 bg-sky-400/15"
                    : d.state === "hoje"
                      ? "border-dashed border-farol-accent"
                      : "border-farol-line bg-farol-surface2"
              }`}
            >
              {d.state === "feito" && <FlameIcon className="h-5 w-5" />}
              {d.state === "bloqueio" && <ShieldIcon className="h-5 w-5" />}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm text-farol-muted">
        {practicedToday
          ? "Chama de hoje garantida. Cada prática conta!"
          : streak > 0
            ? "Faça uma lição hoje para manter a chama acesa."
            : "Faça uma lição hoje para acender a chama."}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-farol-line pt-3 text-sm">
        <span className="flex items-center gap-1.5 text-farol-muted">
          <ShieldIcon className="h-5 w-5" />
          Protetores:{" "}
          <b className="font-num font-extrabold tabular-nums text-farol-ink">
            {freezes}/{MAX_STREAK_FREEZES}
          </b>
        </span>
        {showShopLink ? (
          <Link href="/farol/loja" className="font-semibold uppercase tracking-[.09em] text-farol-accent hover:brightness-125">
            Loja
          </Link>
        ) : (
          <span className="text-farol-muted">
            Recorde:{" "}
            <b className="font-num font-extrabold tabular-nums text-farol-ink">{bestStreak}</b>
          </span>
        )}
      </div>
    </section>
  );
};
