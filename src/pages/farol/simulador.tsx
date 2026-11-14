import type { NextPage } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "~/farol/components/Avatar";
import { Confetti, CountUp } from "~/farol/components/Celebrate";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { CloseIcon, CoinIcon, XpIcon } from "~/farol/components/Icons";
import {
  Button,
  Eyebrow,
  FarolShell,
  Faroldo,
  Feixe,
  Pill,
  ProgressBar,
  card,
} from "~/farol/components/ui";
import { useSounds } from "~/farol/hooks";
import {
  type Scenario,
  type SimEvaluation,
  competencias,
  evaluate,
  scenarios,
} from "~/farol/simulador";
import { useFarolStore } from "~/farol/store";

type Message = { from: "cliente" | "eu"; text: string };

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const toneOf = (pct: number) => (pct >= 80 ? "verde" : pct >= 50 ? "amarelo" : "vermelho");
const barColor = { verde: "#3fcf86", amarelo: "#f5b331", vermelho: "#ff5a4f" } as const;

/* --------------------------------- Lista ---------------------------------- */

const ScenarioList = ({ onPick }: { onPick: (s: Scenario) => void }) => {
  const sims = useFarolStore((s) => s.sims);
  const history = useFarolStore((s) => s.simHistory);
  return (
    <div className="flex flex-col gap-6">
      <header className={`${card} relative overflow-hidden p-5 sm:p-6`}>
        <Feixe />
        <div className="relative">
          <Eyebrow className="text-farol-accent">Simulador de vendas</Eyebrow>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            Pratique a conversa
          </h1>
          <p className="mt-2 max-w-md text-sm text-farol-muted">
            Converse com um cliente fictício como se fosse por mensagem. Ele
            reage ao que você responde e, no fim, você vê como conduziu a
            negociação.
          </p>
        </div>
      </header>

      <ul className="flex flex-col gap-3">
        {scenarios.map((s) => {
          const record = sims[s.id];
          return (
            <li key={s.id}>
              <button
                onClick={() => onPick(s)}
                className={`${card} flex w-full items-center gap-4 p-4 text-left transition hover:border-farol-accent active:translate-y-0.5`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-farol-lamp text-3xl" aria-hidden>
                  {s.cliente.emoji}
                </span>
                <span className="min-w-0 grow">
                  <span className="block font-display text-lg font-extrabold leading-tight tracking-tight">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-farol-muted">{s.resumo}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {s.competencias.map((c) => (
                      <Pill key={c} tone="neutro">
                        {competencias[c].nome}
                      </Pill>
                    ))}
                  </span>
                </span>
                {record ? (
                  <Pill tone={toneOf(record.best)} className="shrink-0 font-num text-sm tabular-nums">
                    {record.best}%
                  </Pill>
                ) : (
                  <Pill tone="rosa" className="shrink-0">Novo</Pill>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <section className={`${card} p-4 opacity-70`}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">Modo livre</p>
          <Pill tone="neutro">Indisponível</Pill>
        </div>
        <p className="mt-1 text-sm text-farol-muted">
          Você escreve as suas próprias mensagens e um cliente simulado
          responde. Depende de um serviço de inteligência artificial
          configurado no servidor, que ainda não existe.
        </p>
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">Suas últimas simulações</h2>
          <ul className={`${card} divide-y divide-farol-line`}>
            {history
              .slice(-6)
              .reverse()
              .map((h, i) => {
                const sc = scenarios.find((s) => s.id === h.id);
                return (
                  <li key={h.date + i} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0 truncate">
                      {sc?.title ?? h.id}
                      <span className="ml-2 text-sm text-farol-muted">
                        {new Date(h.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </span>
                    <Pill tone={toneOf(h.geral)} className="shrink-0 font-num tabular-nums">
                      {h.geral}%
                    </Pill>
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
};

/* -------------------------------- Conversa -------------------------------- */

const Chat = ({
  scenario,
  onExit,
  onDone,
}: {
  scenario: Scenario;
  onExit: () => void;
  onDone: (choices: number[]) => void;
}) => {
  const avatar = useFarolStore((s) => s.avatar);
  const sounds = useSounds();
  const [messages, setMessages] = useState<Message[]>(
    scenario.vendedorAbre ? [] : [{ from: "cliente", text: scenario.abertura }],
  );
  const [round, setRound] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);
  // a ordem das alternativas muda a cada tentativa
  const orders = useMemo(() => scenario.rounds.map((r) => shuffled(r.options.length)), [scenario]);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, typing, round]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const current = scenario.rounds[round];
  const finished = choices.length === scenario.rounds.length;

  const choose = (optionIndex: number) => {
    if (typing || !current) return;
    const option = current.options[optionIndex]!;
    const nextChoices = [...choices, optionIndex];
    sounds.pop();
    setMessages((m) => [...m, { from: "eu", text: option.text }]);
    setChoices(nextChoices);
    setTyping(true);
    timers.current.push(
      setTimeout(() => {
        setMessages((m) => [...m, { from: "cliente", text: option.reply }]);
        setTyping(false);
        if (round + 1 < scenario.rounds.length) setRound(round + 1);
        else timers.current.push(setTimeout(() => onDone(nextChoices), 1300));
      }, 1100),
    );
  };

  return (
    <div className="mx-auto flex h-[100dvh] max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-farol-line bg-farol-surface px-4 py-3">
        <button onClick={onExit} aria-label="Sair da simulação" className="text-farol-muted hover:text-farol-ink">
          <CloseIcon className="h-7 w-7" />
        </button>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-farol-lamp text-2xl" aria-hidden>
          {scenario.cliente.emoji}
        </span>
        <div className="min-w-0 grow">
          <p className="truncate font-semibold leading-tight">{scenario.cliente.nome}</p>
          <p className="truncate text-xs text-farol-muted">
            {typing ? "digitando…" : scenario.cliente.empresa}
          </p>
        </div>
        <span className="shrink-0 font-num text-sm font-extrabold tabular-nums text-farol-muted">
          {Math.min(choices.length + 1, scenario.rounds.length)}/{scenario.rounds.length}
        </span>
      </header>

      <div className="flex grow flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <p className="mx-auto rounded-full bg-farol-surface2 px-3 py-1 text-center text-xs text-farol-muted">
          Cliente fictício · simulação de treino
        </p>
        {scenario.vendedorAbre && (
          <div className={`${card} flex items-start gap-3 p-4`}>
            <Faroldo className="h-10 w-10" />
            <p className="text-sm">{scenario.abertura}</p>
          </div>
        )}
        {messages.map((m, i) =>
          m.from === "cliente" ? (
            <div key={i} className="vd-in flex max-w-[85%] items-end gap-2 self-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farol-lamp text-lg" aria-hidden>
                {scenario.cliente.emoji}
              </span>
              <p className="rounded-2xl rounded-bl-md border border-farol-line bg-farol-surface px-4 py-2.5">
                <span className="sr-only">{scenario.cliente.nome}: </span>
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="vd-in flex max-w-[85%] items-end gap-2 self-end">
              <p className="rounded-2xl rounded-br-md bg-farol-accent px-4 py-2.5 text-white">
                <span className="sr-only">Você: </span>
                {m.text}
              </p>
              <Avatar config={avatar} className="h-8 w-8" label="" />
            </div>
          ),
        )}
        {typing && (
          <div className="flex items-center gap-1 self-start rounded-2xl border border-farol-line bg-farol-surface px-4 py-3" aria-label="Cliente digitando">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-2 w-2 animate-bounce rounded-full bg-farol-muted motion-reduce:animate-none"
                style={{ animationDelay: `${d * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="border-t border-farol-line bg-farol-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {finished ? (
          <p className="py-3 text-center text-sm text-farol-muted">Fechando a conversa…</p>
        ) : (
          <>
            <Eyebrow>Como você responde?</Eyebrow>
            <div className="mt-2 flex flex-col gap-2">
              {current &&
                orders[round]!.map((optionIndex) => (
                  <button
                    key={`${round}-${optionIndex}`}
                    disabled={typing}
                    onClick={() => choose(optionIndex)}
                    className="rounded-2xl border border-b-4 border-farol-line bg-farol-bg px-4 py-3 text-left text-sm transition hover:border-farol-accent active:translate-y-0.5 disabled:opacity-40 sm:text-base"
                  >
                    {current.options[optionIndex]!.text}
                  </button>
                ))}
            </div>
          </>
        )}
      </footer>
    </div>
  );
};

/* -------------------------------- Avaliação ------------------------------- */

const Result = ({
  scenario,
  choices,
  evaluation,
  reward,
  onRetry,
  onExit,
}: {
  scenario: Scenario;
  choices: number[];
  evaluation: SimEvaluation;
  reward: { xp: number; coins: number };
  onRetry: () => void;
  onExit: () => void;
}) => {
  const avatar = useFarolStore((s) => s.avatar);
  const tone = toneOf(evaluation.geral);
  const good = evaluation.desfecho === "otimo";
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      {good && <Confetti kind="rain" count={80} />}
      <header className="vd-stagger flex flex-col items-center gap-3 text-center">
        <Eyebrow className="text-farol-accent">{scenario.title}</Eyebrow>
        <Avatar
          config={avatar}
          animated
          interactive
          celebrate={good}
          mood={good ? "feliz" : evaluation.desfecho === "medio" ? "neutro" : "surpreso"}
          className="h-28 w-28 rounded-full border-4 border-farol-accent"
        />
        <p className="font-num text-6xl font-black tabular-nums leading-none" style={{ color: barColor[tone] }}>
          <CountUp value={evaluation.geral} suffix="%" delay={300} />
        </p>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight">
          {scenario.desfechos[evaluation.desfecho]}
        </h1>
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <Pill tone="rosa" className="text-sm">
            <XpIcon className="h-4 w-4" /> +{reward.xp} faíscas
          </Pill>
          {reward.coins > 0 && (
            <Pill tone="amarelo" className="text-sm">
              <CoinIcon className="h-4 w-4" /> +{reward.coins} moedas
            </Pill>
          )}
        </p>
      </header>

      <section className={`${card} p-5`}>
        <h2 className="font-display text-lg font-extrabold tracking-tight">Como você conduziu</h2>
        <p className="mt-1 text-sm text-farol-muted">
          Cada resposta vale de 0 a 2 pontos nas competências daquela rodada.
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {evaluation.porCompetencia.map((c) => (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{competencias[c.id].nome}</span>
                <span className="font-num font-extrabold tabular-nums" style={{ color: barColor[toneOf(c.pct)] }}>
                  {c.pontos}/{c.max}
                </span>
              </div>
              <ProgressBar value={c.pct / 100} color={barColor[toneOf(c.pct)]} className="mt-1 h-2.5" />
              <p className="mt-1 text-sm text-farol-muted">{competencias[c.id].criterio}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className={`${card} border-farol-ok/50 p-5`}>
          <h2 className="font-display text-lg font-extrabold tracking-tight text-farol-ok">Pontos fortes</h2>
          {evaluation.fortes.length ? (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {evaluation.fortes.map((c) => (
                <li key={c}>✓ {competencias[c].nome}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-farol-muted">Ainda não apareceram nesta conversa. Tente de novo com as dicas ao lado.</p>
          )}
        </section>
        <section className={`${card} border-farol-warn/50 p-5`}>
          <h2 className="font-display text-lg font-extrabold tracking-tight text-farol-warn">Para a próxima tentativa</h2>
          {evaluation.melhorar.length ? (
            <ul className="mt-2 flex flex-col gap-2 text-sm">
              {evaluation.melhorar.map((c) => (
                <li key={c}>
                  <b>{competencias[c].nome}:</b> {competencias[c].dica}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-farol-muted">Nada crítico. Experimente outro cenário para treinar outra situação.</p>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold tracking-tight">Revendo a conversa</h2>
        <ol className="flex flex-col gap-3">
          {scenario.rounds.map((round, i) => {
            const chosen = round.options[choices[i]!]!;
            const points = round.avalia.reduce((a, c) => a + (chosen.scores[c] ?? 0), 0);
            const max = round.avalia.length * 2;
            const best = round.options.reduce((a, b) =>
              round.avalia.reduce((x, c) => x + (b.scores[c] ?? 0), 0) >
              round.avalia.reduce((x, c) => x + (a.scores[c] ?? 0), 0)
                ? b
                : a,
            );
            const t = toneOf((points / max) * 100);
            return (
              <li key={i} className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <Eyebrow>Rodada {i + 1} · {round.avalia.map((c) => competencias[c].nome).join(" e ")}</Eyebrow>
                  <Pill tone={t} className="font-num tabular-nums">{points}/{max}</Pill>
                </div>
                <p className="mt-2 text-sm"><b>Você disse:</b> “{chosen.text}”</p>
                <p className="mt-1 text-sm text-farol-muted">{chosen.note}</p>
                {best !== chosen && (
                  <p className="mt-2 rounded-xl bg-farol-ok-soft px-3 py-2 text-sm text-farol-ok">
                    <b>Um caminho melhor:</b> “{best.text}”
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button className="flex-1" onClick={onRetry}>Tentar de novo</Button>
        <Button variant="ghost" className="flex-1" onClick={onExit}>Outros cenários</Button>
      </div>
    </div>
  );
};

/* --------------------------------- Página --------------------------------- */

const Simulador = () => {
  const finishSimulation = useFarolStore((s) => s.finishSimulation);
  const sounds = useSounds();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    choices: number[];
    evaluation: SimEvaluation;
    reward: { xp: number; coins: number };
  } | null>(null);

  const exit = () => {
    setScenario(null);
    setResult(null);
    window.scrollTo(0, 0);
  };

  if (!scenario) {
    return (
      <FarolLayout title="Simulador">
        <ScenarioList
          onPick={(s) => {
            setScenario(s);
            setResult(null);
            window.scrollTo(0, 0);
          }}
        />
      </FarolLayout>
    );
  }

  return (
    <FarolShell title={scenario.title}>
      {result ? (
        <Result
          scenario={scenario}
          choices={result.choices}
          evaluation={result.evaluation}
          reward={result.reward}
          onExit={exit}
          onRetry={() => {
            setResult(null);
            setAttempt((n) => n + 1);
            window.scrollTo(0, 0);
          }}
        />
      ) : (
        <Chat
          key={`${scenario.id}-${attempt}`}
          scenario={scenario}
          onExit={exit}
          onDone={(choices) => {
            const evaluation = evaluate(scenario, choices);
            const reward = finishSimulation(scenario.id, evaluation);
            sounds.finish(
              evaluation.desfecho === "otimo" ? "verde" : evaluation.desfecho === "medio" ? "amarelo" : "vermelho",
            );
            window.scrollTo(0, 0);
            setResult({ choices, evaluation, reward });
          }}
        />
      )}
    </FarolShell>
  );
};

const SimuladorPage: NextPage = () => <Simulador />;

export default SimuladorPage;
