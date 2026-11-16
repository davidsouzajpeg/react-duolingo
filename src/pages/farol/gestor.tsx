import dayjs from "dayjs";
import type { NextPage } from "next";
import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FarolLayout } from "~/farol/components/FarolLayout";
import { Button, Eyebrow, Pill, ProgressBar, card } from "~/farol/components/ui";
import { ApiError, api, contaAtiva, useConta } from "~/farol/conta";
import { everyLesson, units } from "~/farol/content";
import { scenarios } from "~/farol/simulador";
import { computeStreak, xpThisWeek } from "~/farol/store";

type Estado = {
  xpTotal?: number;
  xpByDate?: Record<string, number>;
  activeDays?: string[];
  frozenDays?: string[];
  lessons?: Record<string, { completions?: number; bestAccuracy?: number }>;
  sims?: Record<string, { attempts: number; best: number }>;
  stats?: { answered: number; correct: number };
  trailCompletedAt?: string | null;
};

type Linha = {
  id: number;
  usuario: string;
  nome: string;
  papel: "vendedor" | "gestor";
  trocarSenha: boolean;
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso: string | null;
  progressoEm: string | null;
  estado: Estado | null;
};

const totalLicoes = everyLesson.length;
const quando = (utc: string | null) =>
  utc ? dayjs(`${utc.replace(" ", "T")}Z`).format("DD/MM/YYYY HH:mm") : "nunca";

const resumo = (l: Linha) => {
  const e = l.estado ?? {};
  const feitas = Object.values(e.lessons ?? {}).filter((r) => (r.completions ?? 0) > 0).length;
  const respondidas = e.stats?.answered ?? 0;
  const diasSemTreinar = l.progressoEm
    ? dayjs().diff(dayjs(`${l.progressoEm.replace(" ", "T")}Z`), "day")
    : null;
  return {
    faiscas: e.xpTotal ?? 0,
    semana: xpThisWeek(e.xpByDate ?? {}),
    chama: computeStreak(e.activeDays ?? [], e.frozenDays ?? []),
    feitas,
    precisao: respondidas ? Math.round(((e.stats?.correct ?? 0) / respondidas) * 100) : null,
    sims: Object.keys(e.sims ?? {}).length,
    concluiu: !!e.trailCompletedAt,
    diasSemTreinar,
  };
};

const campo =
  "w-full rounded-xl border border-farol-line bg-farol-bg px-3 py-2.5 text-farol-ink outline-none focus:border-farol-accent";

const Numero = ({ rotulo, valor }: { rotulo: string; valor: string | number }) => (
  <div className={`${card} min-w-0 px-2 py-3 text-center`}>
    <p className="font-num text-2xl font-black tabular-nums">{valor}</p>
    <p className="text-[10px] font-semibold uppercase leading-tight tracking-[.06em] text-farol-muted">{rotulo}</p>
  </div>
);

const Detalhe = ({ linha }: { linha: Linha }) => {
  const e = linha.estado ?? {};
  return (
    <div className="mt-3 flex flex-col gap-4 border-t border-farol-line pt-3 text-sm">
      <div>
        <Eyebrow>Unidades</Eyebrow>
        <ul className="mt-2 flex flex-col gap-1.5">
          {units.map((u) => {
            const feitas = u.lessons.filter((l) => (e.lessons?.[l.id]?.completions ?? 0) > 0).length;
            return (
              <li key={u.id} className="flex items-center gap-3">
                <span className="min-w-0 grow truncate">{u.title}</span>
                <ProgressBar value={feitas / u.lessons.length} className="h-2 !w-24 shrink-0" color={feitas === u.lessons.length ? "#3fcf86" : "#ff0084"} />
                <span className="w-10 shrink-0 text-right font-num text-xs font-extrabold tabular-nums text-farol-muted">
                  {feitas}/{u.lessons.length}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <Eyebrow>Simulador</Eyebrow>
        <ul className="mt-2 flex flex-col gap-1.5">
          {scenarios.map((s) => {
            const r = e.sims?.[s.id];
            return (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{s.title}</span>
                <span className="shrink-0 font-num text-xs font-extrabold tabular-nums text-farol-muted">
                  {r ? `melhor ${r.best}% · ${r.attempts}×` : "não fez"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-xs text-farol-muted">
        Usuário <b className="text-farol-ink">{linha.usuario}</b> · criado em {quando(linha.criadoEm)} · último acesso{" "}
        {quando(linha.ultimoAcesso)} · último progresso salvo {quando(linha.progressoEm)}
      </p>
    </div>
  );
};

const Painel = () => {
  const eu = useConta((s) => s.usuario);
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [aberto, setAberto] = useState<number | null>(null);
  const [confirmar, setConfirmar] = useState<{ tipo: "senha" | "desativar"; linha: Linha } | null>(null);
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [papel, setPapel] = useState<"vendedor" | "gestor">("vendedor");
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(() => {
    api<{ usuarios: Linha[] }>("gestor/usuarios")
      .then((r) => {
        setLinhas(r.usuarios);
        setErro("");
      })
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar."));
  }, []);
  useEffect(carregar, [carregar]);

  const acao = (rota: string, corpo: unknown, mensagem: string) => {
    setOcupado(true);
    setAviso("");
    setErro("");
    return api(rota, corpo)
      .then(() => {
        setAviso(mensagem);
        carregar();
        return true;
      })
      .catch((e) => {
        setErro(e instanceof ApiError ? e.message : "Não foi possível concluir.");
        return false;
      })
      .finally(() => setOcupado(false));
  };

  const criar = (e: FormEvent) => {
    e.preventDefault();
    void acao(
      "gestor/criar",
      { nome, usuario, papel },
      `Acesso criado. Passe para ${nome.split(" ")[0]}: usuário “${usuario.trim().toLowerCase()}” e senha 1234. No primeiro acesso o app pede uma senha nova.`,
    ).then((ok) => {
      if (ok) {
        setNome("");
        setUsuario("");
        setPapel("vendedor");
      }
    });
  };

  const ordenadas = useMemo(
    () =>
      (linhas ?? [])
        .map((l) => ({ l, r: resumo(l) }))
        .sort((a, b) => Number(b.l.ativo) - Number(a.l.ativo) || b.r.semana - a.r.semana || b.r.faiscas - a.r.faiscas),
    [linhas],
  );
  const vendedores = ordenadas.filter((x) => x.l.ativo && x.l.papel === "vendedor");
  const treinaram = vendedores.filter((x) => x.r.diasSemTreinar !== null && x.r.diasSemTreinar < 7).length;
  const concluiram = vendedores.filter((x) => x.r.concluiu).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <Eyebrow className="text-farol-accent">Painel do gestor</Eyebrow>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Equipe no Vendê</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Numero rotulo="Vendedores" valor={vendedores.length} />
        <Numero rotulo="Treinaram em 7 dias" valor={treinaram} />
        <Numero rotulo="Trilha concluída" valor={concluiram} />
      </div>

      {aviso && (
        <p role="status" className="rounded-xl bg-farol-ok-soft px-4 py-3 text-sm font-semibold text-farol-ok">
          {aviso}
        </p>
      )}
      {erro && (
        <p role="alert" className="rounded-xl bg-farol-bad-soft px-4 py-3 text-sm font-semibold text-farol-bad">
          {erro}
        </p>
      )}

      <section aria-label="Relatório da equipe" className="flex flex-col gap-3">
        <Eyebrow>Relatório</Eyebrow>
        {linhas === null && !erro && <p className="text-farol-muted">Carregando…</p>}
        {ordenadas.map(({ l, r }) => (
          <article key={l.id} className={`${card} p-4 ${l.ativo ? "" : "opacity-60"}`}>
            <button className="flex w-full items-start gap-3 text-left" onClick={() => setAberto(aberto === l.id ? null : l.id)} aria-expanded={aberto === l.id}>
              <div className="min-w-0 grow">
                <p className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold leading-tight tracking-tight">
                  {l.nome}
                  {l.papel === "gestor" && <Pill tone="rosa">Gestor</Pill>}
                  {!l.ativo && <Pill tone="neutro">Desativado</Pill>}
                  {l.ativo && l.trocarSenha && <Pill tone="amarelo">Ainda não entrou</Pill>}
                  {r.concluiu && <Pill tone="verde">Trilha concluída</Pill>}
                </p>
                <p className="mt-0.5 text-xs text-farol-muted">
                  {r.diasSemTreinar === null
                    ? "Sem progresso salvo"
                    : r.diasSemTreinar === 0
                      ? "Treinou hoje"
                      : `Último treino há ${r.diasSemTreinar} ${r.diasSemTreinar === 1 ? "dia" : "dias"}`}
                </p>
              </div>
              <span className="shrink-0 text-right">
                <b className="block font-num text-xl font-black tabular-nums text-farol-accent">{r.semana}</b>
                <span className="text-[10px] font-semibold uppercase tracking-[.09em] text-farol-muted">faíscas na semana</span>
              </span>
            </button>
            <div className="mt-3">
              <ProgressBar value={r.feitas / totalLicoes} className="h-2" />
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ["Lições", `${r.feitas}/${totalLicoes}`],
                ["Precisão", r.precisao === null ? "–" : `${r.precisao}%`],
                ["Chama", `${r.chama}d`],
                ["Faíscas", r.faiscas],
              ].map(([rotulo, valor]) => (
                <div key={rotulo}>
                  <dd className="font-num text-base font-extrabold tabular-nums">{valor}</dd>
                  <dt className="text-[10px] font-semibold uppercase tracking-[.09em] text-farol-muted">{rotulo}</dt>
                </div>
              ))}
            </dl>
            {aberto === l.id && (
              <>
                <Detalhe linha={l} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    disabled={ocupado}
                    onClick={() => setConfirmar({ tipo: "senha", linha: l })}
                    className="rounded-full bg-farol-accent-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-farol-accent disabled:opacity-40"
                  >
                    Redefinir senha
                  </button>
                  {l.id !== eu?.id &&
                    (l.ativo ? (
                      <button
                        disabled={ocupado}
                        onClick={() => setConfirmar({ tipo: "desativar", linha: l })}
                        className="rounded-full bg-farol-bad-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-farol-bad disabled:opacity-40"
                      >
                        Desativar acesso
                      </button>
                    ) : (
                      <button
                        disabled={ocupado}
                        onClick={() => void acao("gestor/ativar", { id: l.id, ativo: true }, `Acesso de ${l.nome} reativado.`)}
                        className="rounded-full bg-farol-ok-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-farol-ok disabled:opacity-40"
                      >
                        Reativar acesso
                      </button>
                    ))}
                </div>
              </>
            )}
          </article>
        ))}
      </section>

      <section aria-label="Novo usuário" className={`${card} p-5`}>
        <Eyebrow className="text-farol-accent">Novo usuário</Eyebrow>
        <form onSubmit={criar} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Nome
            <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ana Silva" required maxLength={80} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Usuário (para entrar)
            <input
              className={campo}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="ana.silva"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              pattern="[A-Za-z0-9._\-]{3,30}"
              title="De 3 a 30 caracteres: letras, números, ponto, hífen ou sublinhado"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Tipo de acesso
            <select className={campo} value={papel} onChange={(e) => setPapel(e.target.value as "vendedor" | "gestor")}>
              <option value="vendedor">Vendedor</option>
              <option value="gestor">Gestor (vê este painel)</option>
            </select>
          </label>
          <p className="text-xs text-farol-muted">
            A senha inicial é 1234. No primeiro acesso o app obriga a criar uma senha nova.
          </p>
          <Button type="submit" disabled={ocupado || !nome.trim() || !usuario.trim()}>
            Criar acesso
          </Button>
        </form>
      </section>

      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/80 sm:items-center" onClick={() => setConfirmar(null)}>
          <div role="dialog" aria-modal className="w-full max-w-md rounded-t-3xl border border-farol-line bg-farol-surface p-6 text-center sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              {confirmar.tipo === "senha" ? "Redefinir a senha?" : "Desativar o acesso?"}
            </h2>
            <p className="mt-2 text-farol-muted">
              {confirmar.tipo === "senha"
                ? `A senha de ${confirmar.linha.nome} volta a ser 1234 e o app pede uma nova no próximo acesso. O progresso é mantido.`
                : `${confirmar.linha.nome} não consegue mais entrar. O progresso fica guardado e você pode reativar depois.`}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button
                variant={confirmar.tipo === "senha" ? "primary" : "danger"}
                disabled={ocupado}
                onClick={() => {
                  const { tipo, linha } = confirmar;
                  setConfirmar(null);
                  void (tipo === "senha"
                    ? acao("gestor/redefinir-senha", { id: linha.id }, `Senha de ${linha.nome} redefinida para 1234.`)
                    : acao("gestor/ativar", { id: linha.id, ativo: false }, `Acesso de ${linha.nome} desativado.`));
                }}
              >
                {confirmar.tipo === "senha" ? "Redefinir para 1234" : "Desativar"}
              </Button>
              <button onClick={() => setConfirmar(null)} className="py-2 font-display font-extrabold uppercase tracking-wide text-farol-muted">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GestorPage: NextPage = () => {
  const usuario = useConta((s) => s.usuario);
  return (
    <FarolLayout title="Painel do gestor">
      {contaAtiva && usuario?.papel === "gestor" ? (
        <Painel />
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="font-display text-xl font-extrabold tracking-tight">Área restrita ao gestor.</p>
          <Link href="/farol" className="font-semibold text-farol-accent hover:underline">
            Voltar para a trilha
          </Link>
        </div>
      )}
    </FarolLayout>
  );
};

export default GestorPage;
