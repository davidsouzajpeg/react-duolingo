import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ApiError, api, carregarConteudo } from "~/farol/conta";
import { MIN_QUESTOES, type UnidadeGestor, setUnidadesGestor } from "~/farol/content";
import type { Question } from "~/farol/types";
import { Button, Eyebrow, Pill, card } from "./ui";

/**
 * Editor de conteúdo do gestor: unidades novas (sempre no fim da trilha),
 * lições e questões nos cinco modelos do app. Tudo nasce como rascunho; o
 * gestor testa a lição e só então publica a unidade.
 */

type Licao = UnidadeGestor["lessons"][number];
type Kind = Question["kind"];

const novoId = (n: number) => Math.random().toString(36).slice(2, 2 + n).padEnd(n, "0");

const campo =
  "w-full rounded-xl border border-farol-line bg-farol-bg px-3 py-2.5 text-farol-ink outline-none focus:border-farol-accent";
const chip =
  "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] disabled:opacity-40";

const modelos: Record<Kind, { nome: string; quando: string }> = {
  cenario: { nome: "Situação com cliente", quando: "O cliente fala algo e o vendedor escolhe como responder." },
  multipla: { nome: "Múltipla escolha", quando: "Uma pergunta e de 2 a 4 alternativas." },
  vf: { nome: "Verdadeiro ou falso", quando: "Uma afirmação para julgar." },
  ordenar: { nome: "Colocar na ordem", quando: "Passos de um processo fora de ordem." },
  completar: { nome: "Completar a frase", quando: "Uma frase com lacunas e um banco de palavras." },
};

const resumoDe = (q: Question) =>
  q.kind === "vf" ? q.statement : q.kind === "completar" ? q.sentence : q.kind === "cenario" ? `“${q.customer}”` : q.prompt;

const Rotulo = ({ texto, ajuda, children }: { texto: string; ajuda?: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-semibold">
    {texto}
    {children}
    {ajuda && <span className="text-xs font-normal text-farol-muted">{ajuda}</span>}
  </label>
);

/* ------------------------------ Formulário de questão ------------------------------ */

type Rascunho = {
  kind: Kind;
  prompt: string;
  customer: string;
  context: string;
  options: string[];
  answer: number;
  statement: string;
  vfAnswer: boolean;
  steps: string[];
  sentence: string;
  blanks: string;
  distractors: string;
  explanation: string;
};

const vazio = (kind: Kind): Rascunho => ({
  kind,
  prompt: "",
  customer: "",
  context: "",
  options: ["", "", ""],
  answer: 0,
  statement: "",
  vfAnswer: true,
  steps: ["", "", ""],
  sentence: "",
  blanks: "",
  distractors: "",
  explanation: "",
});

const paraRascunho = (q: Question): Rascunho => {
  const r = vazio(q.kind);
  r.explanation = q.explanation;
  if (q.kind === "multipla" || q.kind === "cenario") {
    r.prompt = q.prompt;
    r.options = [...q.options];
    r.answer = q.answer;
    if (q.kind === "cenario") {
      r.customer = q.customer;
      r.context = q.context ?? "";
    }
  } else if (q.kind === "vf") {
    r.statement = q.statement;
    r.vfAnswer = q.answer;
  } else if (q.kind === "ordenar") {
    r.prompt = q.prompt;
    r.steps = [...q.steps];
  } else {
    r.sentence = q.sentence;
    r.blanks = q.answer.join(", ");
    r.distractors = q.distractors.join(", ");
  }
  return r;
};

const lista = (texto: string) =>
  texto
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

/** monta a questão ou devolve a mensagem do que falta */
const montar = (r: Rascunho): Question | string => {
  const explanation = r.explanation.trim();
  if (explanation.length < 15) return "Escreva a explicação: é ela que ensina quando o vendedor erra.";
  if (r.kind === "multipla" || r.kind === "cenario") {
    const options = r.options.map((o) => o.trim());
    if (options.some((o) => !o)) return "Preencha todas as alternativas (ou remova as vazias).";
    if (new Set(options).size !== options.length) return "Há alternativas repetidas.";
    if (!r.prompt.trim()) return "Escreva a pergunta.";
    if (r.kind === "cenario") {
      if (!r.customer.trim()) return "Escreva a fala do cliente.";
      return {
        kind: "cenario",
        customer: r.customer.trim(),
        context: r.context.trim() || undefined,
        prompt: r.prompt.trim(),
        options,
        answer: r.answer,
        explanation,
      };
    }
    return { kind: "multipla", prompt: r.prompt.trim(), options, answer: r.answer, explanation };
  }
  if (r.kind === "vf") {
    if (!r.statement.trim()) return "Escreva a afirmação.";
    return { kind: "vf", statement: r.statement.trim(), answer: r.vfAnswer, explanation };
  }
  if (r.kind === "ordenar") {
    const steps = r.steps.map((s) => s.trim());
    if (steps.some((s) => !s)) return "Preencha todos os passos (ou remova os vazios).";
    if (new Set(steps).size !== steps.length) return "Há passos repetidos.";
    if (!r.prompt.trim()) return "Escreva o enunciado.";
    return { kind: "ordenar", prompt: r.prompt.trim(), steps, explanation };
  }
  const lacunas = (r.sentence.match(/___/g) ?? []).length;
  const answer = lista(r.blanks);
  const distractors = lista(r.distractors).filter((d) => !answer.includes(d));
  if (!lacunas) return "Marque cada lacuna da frase com três sublinhados: ___";
  if (answer.length !== lacunas)
    return `A frase tem ${lacunas} ${lacunas === 1 ? "lacuna" : "lacunas"}; informe ${lacunas === 1 ? "1 palavra certa" : `${lacunas} palavras certas, na ordem`}.`;
  if (new Set(answer).size !== answer.length) return "As palavras certas não podem se repetir.";
  if (!distractors.length) return "Informe pelo menos uma palavra errada para o banco de palavras.";
  return { kind: "completar", prompt: "Complete a frase", sentence: r.sentence.trim(), answer, distractors, explanation };
};

const ListaDeTextos = ({
  itens,
  onChange,
  min,
  max,
  rotulo,
  correta,
  onCorreta,
}: {
  itens: string[];
  onChange: (itens: string[]) => void;
  min: number;
  max: number;
  rotulo: (i: number) => string;
  correta?: number;
  onCorreta?: (i: number) => void;
}) => (
  <div className="flex flex-col gap-2">
    {itens.map((texto, i) => (
      <div key={i} className="flex items-center gap-2">
        {onCorreta && (
          <input
            type="radio"
            name="correta"
            className="h-5 w-5 shrink-0 accent-farol-ok"
            checked={correta === i}
            onChange={() => onCorreta(i)}
            aria-label={`Marcar ${rotulo(i)} como a certa`}
          />
        )}
        <input
          className={campo}
          value={texto}
          placeholder={rotulo(i)}
          aria-label={rotulo(i)}
          onChange={(e) => onChange(itens.map((t, k) => (k === i ? e.target.value : t)))}
        />
        {itens.length > min && (
          <button
            type="button"
            aria-label={`Remover ${rotulo(i)}`}
            className="shrink-0 px-2 text-lg text-farol-muted hover:text-farol-bad"
            onClick={() => {
              onChange(itens.filter((_, k) => k !== i));
              if (onCorreta && correta !== undefined) onCorreta(correta > i ? correta - 1 : correta === i ? 0 : correta);
            }}
          >
            ×
          </button>
        )}
      </div>
    ))}
    {itens.length < max && (
      <button type="button" className="self-start text-xs font-semibold uppercase tracking-[.09em] text-farol-accent" onClick={() => onChange([...itens, ""])}>
        + Adicionar
      </button>
    )}
  </div>
);

const QuestaoForm = ({
  inicial,
  onSalvar,
  onCancelar,
}: {
  inicial: Question | null;
  onSalvar: (q: Question) => void;
  onCancelar: () => void;
}) => {
  const [r, setR] = useState<Rascunho>(() => (inicial ? paraRascunho(inicial) : vazio("cenario")));
  const [erro, setErro] = useState("");
  const set = (parte: Partial<Rascunho>) => setR((atual) => ({ ...atual, ...parte }));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-farol-accent/50 bg-farol-bg p-4">
      <Eyebrow className="text-farol-accent">{inicial ? "Editar questão" : "Nova questão"}</Eyebrow>
      {!inicial && (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Modelo da questão">
          {(Object.keys(modelos) as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={r.kind === k}
              onClick={() => setR({ ...vazio(k), explanation: r.explanation })}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                r.kind === k ? "border-farol-accent bg-farol-accent-soft" : "border-farol-line"
              }`}
            >
              <b className="block">{modelos[k].nome}</b>
              <span className="text-xs text-farol-muted">{modelos[k].quando}</span>
            </button>
          ))}
        </div>
      )}

      {r.kind === "cenario" && (
        <>
          <Rotulo texto="Contexto (opcional)" ajuda="Onde e com quem. Ex.: Dona de loja de roupas, primeira visita.">
            <input className={campo} value={r.context} onChange={(e) => set({ context: e.target.value })} />
          </Rotulo>
          <Rotulo texto="Fala do cliente" ajuda="Escreva como o cliente falaria de verdade.">
            <textarea className={campo} rows={2} value={r.customer} onChange={(e) => set({ customer: e.target.value })} />
          </Rotulo>
        </>
      )}
      {(r.kind === "cenario" || r.kind === "multipla" || r.kind === "ordenar") && (
        <Rotulo
          texto={r.kind === "ordenar" ? "Enunciado" : "Pergunta"}
          ajuda={r.kind === "cenario" ? "Ex.: Qual a melhor resposta?" : r.kind === "ordenar" ? "Ex.: Coloque as etapas da visita na ordem." : undefined}
        >
          <textarea className={campo} rows={2} value={r.prompt} onChange={(e) => set({ prompt: e.target.value })} />
        </Rotulo>
      )}
      {(r.kind === "cenario" || r.kind === "multipla") && (
        <div className="flex flex-col gap-1 text-sm font-semibold">
          Alternativas
          <span className="text-xs font-normal text-farol-muted">
            Marque a certa na bolinha. As erradas devem ser erros que um vendedor cometeria de verdade.
          </span>
          <ListaDeTextos
            itens={r.options}
            onChange={(options) => set({ options })}
            min={2}
            max={4}
            rotulo={(i) => `Alternativa ${i + 1}`}
            correta={r.answer}
            onCorreta={(answer) => set({ answer })}
          />
        </div>
      )}
      {r.kind === "vf" && (
        <>
          <Rotulo texto="Afirmação">
            <textarea className={campo} rows={2} value={r.statement} onChange={(e) => set({ statement: e.target.value })} />
          </Rotulo>
          <div className="flex gap-2" role="radiogroup" aria-label="A afirmação é">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                role="radio"
                aria-checked={r.vfAnswer === v}
                onClick={() => set({ vfAnswer: v })}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                  r.vfAnswer === v ? "border-farol-ok bg-farol-ok-soft text-farol-ok" : "border-farol-line text-farol-muted"
                }`}
              >
                {v ? "É verdadeira" : "É falsa"}
              </button>
            ))}
          </div>
        </>
      )}
      {r.kind === "ordenar" && (
        <div className="flex flex-col gap-1 text-sm font-semibold">
          Passos, já na ordem certa
          <span className="text-xs font-normal text-farol-muted">O app embaralha para o vendedor.</span>
          <ListaDeTextos itens={r.steps} onChange={(steps) => set({ steps })} min={3} max={6} rotulo={(i) => `Passo ${i + 1}`} />
        </div>
      )}
      {r.kind === "completar" && (
        <>
          <Rotulo texto="Frase com lacunas" ajuda="Use ___ (três sublinhados) em cada lacuna. Ex.: Antes de propor, faça o ___ do cliente.">
            <textarea className={campo} rows={2} value={r.sentence} onChange={(e) => set({ sentence: e.target.value })} />
          </Rotulo>
          <Rotulo texto="Palavras certas" ajuda="Na ordem das lacunas, separadas por vírgula.">
            <input className={campo} value={r.blanks} onChange={(e) => set({ blanks: e.target.value })} />
          </Rotulo>
          <Rotulo texto="Palavras erradas" ajuda="Para o banco de palavras, separadas por vírgula.">
            <input className={campo} value={r.distractors} onChange={(e) => set({ distractors: e.target.value })} />
          </Rotulo>
        </>
      )}

      <Rotulo texto="Explicação" ajuda="Aparece depois da resposta. Diga por que a certa funciona: é aqui que o vendedor aprende.">
        <textarea className={campo} rows={3} value={r.explanation} onChange={(e) => set({ explanation: e.target.value })} />
      </Rotulo>

      {erro && (
        <p role="alert" className="rounded-xl bg-farol-bad-soft px-3 py-2 text-sm font-semibold text-farol-bad">
          {erro}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          className="flex-1 !px-3 !py-2.5 text-sm"
          onClick={() => {
            const q = montar(r);
            if (typeof q === "string") return setErro(q);
            onSalvar(q);
          }}
        >
          Salvar questão
        </Button>
        <Button variant="ghost" className="flex-1 !px-3 !py-2.5 text-sm" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

/* ---------------------------------- Editor ---------------------------------- */

export const EditorConteudo = () => {
  const [unidades, setUnidades] = useState<UnidadeGestor[] | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [unidadeAberta, setUnidadeAberta] = useState<string | null>(null);
  const [licaoAberta, setLicaoAberta] = useState<string | null>(null);
  /** índice da questão em edição; -1 = nova */
  const [questao, setQuestao] = useState<number | null>(null);
  const [excluir, setExcluir] = useState<{ rotulo: string; fazer: () => UnidadeGestor[] } | null>(null);

  useEffect(() => {
    carregarConteudo()
      .then((r) => {
        setUnidades(r.unidades);
        setBase(r.atualizadoEm);
      })
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o conteúdo."));
  }, []);

  /** grava a lista inteira no servidor e atualiza a trilha deste aparelho */
  const salvar = (proximas: UnidadeGestor[], mensagem = "Salvo.") => {
    const anteriores = unidades;
    setUnidades(proximas);
    setSalvando(true);
    setErro("");
    setAviso("");
    return api<{ atualizadoEm: string }>("gestor/conteudo", { unidades: proximas, base })
      .then((r) => {
        setBase(r.atualizadoEm);
        setUnidadesGestor(proximas);
        setAviso(mensagem);
        return true;
      })
      .catch((e) => {
        setUnidades(anteriores);
        setErro(e instanceof ApiError ? e.message : "Não foi possível salvar.");
        return false;
      })
      .finally(() => setSalvando(false));
  };

  if (unidades === null) {
    return erro ? (
      <p role="alert" className="rounded-xl bg-farol-bad-soft px-4 py-3 text-sm font-semibold text-farol-bad">{erro}</p>
    ) : (
      <p className="text-farol-muted">Carregando…</p>
    );
  }

  const trocarUnidade = (id: string, parte: Partial<UnidadeGestor>) =>
    unidades.map((u) => (u.id === id ? { ...u, ...parte } : u));
  const trocarLicao = (u: UnidadeGestor, licaoId: string, parte: Partial<Licao>) =>
    trocarUnidade(u.id, { lessons: u.lessons.map((l) => (l.id === licaoId ? { ...l, ...parte } : l)) });

  const unidade = unidades.find((u) => u.id === unidadeAberta) ?? null;
  const licao = unidade?.lessons.find((l) => l.id === licaoAberta) ?? null;

  const mensagens = (
    <>
      {aviso && (
        <p role="status" className="rounded-xl bg-farol-ok-soft px-4 py-3 text-sm font-semibold text-farol-ok">{aviso}</p>
      )}
      {erro && (
        <p role="alert" className="rounded-xl bg-farol-bad-soft px-4 py-3 text-sm font-semibold text-farol-bad">{erro}</p>
      )}
    </>
  );

  const confirmacao = excluir && (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-farol-lamp/80 sm:items-center" onClick={() => setExcluir(null)}>
      <div role="dialog" aria-modal className="w-full max-w-md rounded-t-3xl border border-farol-line bg-farol-surface p-6 text-center sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Excluir {excluir.rotulo}?</h2>
        <p className="mt-2 text-farol-muted">Não dá para desfazer. O que os vendedores já pontuaram continua com eles.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Button
            variant="danger"
            onClick={() => {
              const proximas = excluir.fazer();
              setExcluir(null);
              void salvar(proximas, "Excluído.");
            }}
          >
            Excluir
          </Button>
          <button onClick={() => setExcluir(null)} className="py-2 font-display font-extrabold uppercase tracking-wide text-farol-muted">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------- uma lição ------------------------------- */
  if (unidade && licao) {
    const faltam = MIN_QUESTOES - licao.questions.length;
    return (
      <div className="flex flex-col gap-4">
        <button className="self-start text-sm font-semibold text-farol-accent" onClick={() => { setLicaoAberta(null); setQuestao(null); setAviso(""); }}>
          ← {unidade.title}
        </button>
        <CamposDeTexto
          key={licao.id}
          titulo="Lição"
          campos={[
            { chave: "title", rotulo: "Título da lição", valor: licao.title, obrigatorio: true },
            {
              chave: "tip",
              rotulo: "Dica do Faroldo",
              valor: licao.tip ?? "",
              longo: true,
              ajuda: "Abre a lição e ensina a ideia em uma ou duas frases, antes da prática.",
            },
          ]}
          salvando={salvando}
          onSalvar={(v) => void salvar(trocarLicao(unidade, licao.id, { title: v.title!, tip: v.tip }), "Lição salva.")}
        />
        {mensagens}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Questões ({licao.questions.length})</Eyebrow>
            {faltam > 0 ? (
              <Pill tone="amarelo">Faltam {faltam} para entrar na trilha</Pill>
            ) : (
              <Link href={`/farol/praticar?id=${licao.id}&teste=1`} className={`${chip} bg-farol-accent-soft text-farol-accent`}>
                Testar lição
              </Link>
            )}
          </div>
          {licao.questions.map((q, i) =>
            questao === i ? (
              <QuestaoForm
                key={i}
                inicial={q}
                onCancelar={() => setQuestao(null)}
                onSalvar={(nova) => {
                  setQuestao(null);
                  void salvar(trocarLicao(unidade, licao.id, { questions: licao.questions.map((x, k) => (k === i ? nova : x)) }), "Questão salva.");
                }}
              />
            ) : (
              <article key={i} className={`${card} p-4`}>
                <Eyebrow className="text-farol-accent">
                  {i + 1} · {modelos[q.kind].nome}
                </Eyebrow>
                <p className="mt-1 text-sm">{resumoDe(q)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className={`${chip} bg-farol-accent-soft text-farol-accent`} disabled={salvando} onClick={() => setQuestao(i)}>
                    Editar
                  </button>
                  {i > 0 && (
                    <button
                      className={`${chip} bg-farol-surface2 text-farol-muted`}
                      disabled={salvando}
                      onClick={() => {
                        const qs = [...licao.questions];
                        [qs[i - 1], qs[i]] = [qs[i]!, qs[i - 1]!];
                        void salvar(trocarLicao(unidade, licao.id, { questions: qs }));
                      }}
                    >
                      Subir
                    </button>
                  )}
                  <button
                    className={`${chip} bg-farol-bad-soft text-farol-bad`}
                    disabled={salvando}
                    onClick={() =>
                      setExcluir({
                        rotulo: `a questão ${i + 1}`,
                        fazer: () => trocarLicao(unidade, licao.id, { questions: licao.questions.filter((_, k) => k !== i) }),
                      })
                    }
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ),
          )}
          {questao === -1 ? (
            <QuestaoForm
              inicial={null}
              onCancelar={() => setQuestao(null)}
              onSalvar={(nova) => {
                setQuestao(null);
                void salvar(trocarLicao(unidade, licao.id, { questions: [...licao.questions, nova] }), "Questão adicionada.");
              }}
            />
          ) : (
            questao === null && (
              <Button variant="ghost" onClick={() => { setAviso(""); setQuestao(-1); }}>
                + Nova questão
              </Button>
            )
          )}
        </section>
        {confirmacao}
      </div>
    );
  }

  /* ------------------------------ uma unidade ------------------------------ */
  if (unidade) {
    const completas = unidade.lessons.filter((l) => l.questions.length >= MIN_QUESTOES).length;
    return (
      <div className="flex flex-col gap-4">
        <button className="self-start text-sm font-semibold text-farol-accent" onClick={() => { setUnidadeAberta(null); setAviso(""); }}>
          ← Todas as unidades
        </button>
        <CamposDeTexto
          key={unidade.id}
          titulo="Unidade"
          campos={[
            { chave: "title", rotulo: "Título da unidade", valor: unidade.title, obrigatorio: true },
            { chave: "description", rotulo: "Descrição curta", valor: unidade.description, ajuda: "Uma linha sobre o que o vendedor vai praticar." },
          ]}
          extra={
            <Rotulo texto="Assunto">
              <select
                className={campo}
                value={unidade.tema}
                disabled={salvando}
                onChange={(e) => void salvar(trocarUnidade(unidade.id, { tema: e.target.value as UnidadeGestor["tema"] }))}
              >
                <option value="vendas">Técnica de venda</option>
                <option value="produto">Produto e materiais</option>
              </select>
            </Rotulo>
          }
          salvando={salvando}
          onSalvar={(v) => void salvar(trocarUnidade(unidade.id, { title: v.title!, description: v.description ?? "" }), "Unidade salva.")}
        />
        {mensagens}

        <div className={`${card} flex flex-col gap-3 p-4`}>
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Situação</Eyebrow>
            <Pill tone={unidade.publicada ? "verde" : "neutro"}>{unidade.publicada ? "Publicada" : "Rascunho"}</Pill>
          </div>
          <p className="text-sm text-farol-muted">
            {unidade.publicada
              ? "Os vendedores veem esta unidade no fim da trilha. Mudanças aparecem para eles no próximo acesso."
              : completas === 0
                ? `Para publicar, a unidade precisa de pelo menos uma lição com ${MIN_QUESTOES} questões.`
                : "Rascunho: só você vê. Teste as lições e publique quando estiver pronta."}
          </p>
          {unidade.publicada ? (
            <Button variant="ghost" disabled={salvando} onClick={() => void salvar(trocarUnidade(unidade.id, { publicada: false }), "Unidade tirada do ar.")}>
              Tirar do ar
            </Button>
          ) : (
            <Button variant="success" disabled={salvando || completas === 0} onClick={() => void salvar(trocarUnidade(unidade.id, { publicada: true }), "Unidade publicada. Ela já aparece no fim da trilha dos vendedores.")}>
              Publicar unidade
            </Button>
          )}
          <p className="text-xs text-farol-muted">O desafio da unidade é montado sozinho, com questões das lições.</p>
        </div>

        <section className="flex flex-col gap-3">
          <Eyebrow>Lições ({unidade.lessons.length})</Eyebrow>
          {unidade.lessons.map((l, i) => (
            <article key={l.id} className={`${card} p-4`}>
              <button className="w-full text-left" onClick={() => { setLicaoAberta(l.id); setAviso(""); }}>
                <p className="font-display text-lg font-extrabold leading-tight tracking-tight">
                  {i + 1}. {l.title}
                </p>
                <p className={`mt-0.5 text-xs ${l.questions.length >= MIN_QUESTOES ? "text-farol-muted" : "text-farol-warn"}`}>
                  {l.questions.length} {l.questions.length === 1 ? "questão" : "questões"}
                  {l.questions.length < MIN_QUESTOES && ` · incompleta (mínimo ${MIN_QUESTOES})`}
                </p>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={`${chip} bg-farol-accent-soft text-farol-accent`} onClick={() => { setLicaoAberta(l.id); setAviso(""); }}>
                  Abrir
                </button>
                {i > 0 && (
                  <button
                    className={`${chip} bg-farol-surface2 text-farol-muted`}
                    disabled={salvando}
                    onClick={() => {
                      const ls = [...unidade.lessons];
                      [ls[i - 1], ls[i]] = [ls[i]!, ls[i - 1]!];
                      void salvar(trocarUnidade(unidade.id, { lessons: ls }));
                    }}
                  >
                    Subir
                  </button>
                )}
                <button
                  className={`${chip} bg-farol-bad-soft text-farol-bad`}
                  disabled={salvando}
                  onClick={() =>
                    setExcluir({
                      rotulo: `a lição “${l.title}”`,
                      fazer: () => trocarUnidade(unidade.id, { lessons: unidade.lessons.filter((x) => x.id !== l.id) }),
                    })
                  }
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
          <Button
            variant="ghost"
            disabled={salvando}
            onClick={() => {
              const id = `${unidade.id}-l${novoId(5)}`;
              void salvar(
                trocarUnidade(unidade.id, { lessons: [...unidade.lessons, { id, title: "Nova lição", tip: "", questions: [] }] }),
                "Lição criada. Dê um título e adicione as questões.",
              ).then((ok) => ok && setLicaoAberta(id));
            }}
          >
            + Nova lição
          </Button>
        </section>
        {confirmacao}
      </div>
    );
  }

  /* ------------------------------- a lista ------------------------------- */
  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} p-4 text-sm text-farol-muted`}>
        <b className="text-farol-ink">Como funciona.</b> Você cria unidades novas, que entram no fim da trilha, depois
        das que já existem. Cada lição precisa de pelo menos {MIN_QUESTOES} questões. Tudo começa como rascunho: teste
        a lição e publique a unidade quando estiver boa.
      </div>
      {mensagens}
      {unidades.length === 0 && <p className="text-farol-muted">Nenhuma unidade criada ainda.</p>}
      {unidades.map((u) => (
        <article key={u.id} className={`${card} p-4`}>
          <button className="w-full text-left" onClick={() => { setUnidadeAberta(u.id); setAviso(""); }}>
            <p className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold leading-tight tracking-tight">
              {u.title}
              <Pill tone={u.publicada ? "verde" : "neutro"}>{u.publicada ? "Publicada" : "Rascunho"}</Pill>
            </p>
            <p className="mt-0.5 text-xs text-farol-muted">
              {u.tema === "produto" ? "Produto e materiais" : "Técnica de venda"} · {u.lessons.length}{" "}
              {u.lessons.length === 1 ? "lição" : "lições"}
            </p>
          </button>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className={`${chip} bg-farol-accent-soft text-farol-accent`} onClick={() => { setUnidadeAberta(u.id); setAviso(""); }}>
              Abrir
            </button>
            <button
              className={`${chip} bg-farol-bad-soft text-farol-bad`}
              disabled={salvando}
              onClick={() => setExcluir({ rotulo: `a unidade “${u.title}”`, fazer: () => unidades.filter((x) => x.id !== u.id) })}
            >
              Excluir
            </button>
          </div>
        </article>
      ))}
      <Button
        disabled={salvando}
        onClick={() => {
          const id = `c${novoId(8)}`;
          void salvar(
            [...unidades, { id, title: "Nova unidade", description: "", tema: "vendas", publicada: false, lessons: [] }],
            "Unidade criada. Dê um título e adicione as lições.",
          ).then((ok) => ok && setUnidadeAberta(id));
        }}
      >
        + Nova unidade
      </Button>
      {confirmacao}
    </div>
  );
};

/** bloco de campos de texto com botão de salvar (título, descrição, dica) */
const CamposDeTexto = ({
  titulo,
  campos,
  extra,
  salvando,
  onSalvar,
}: {
  titulo: string;
  campos: { chave: string; rotulo: string; valor: string; ajuda?: string; longo?: boolean; obrigatorio?: boolean }[];
  extra?: ReactNode;
  salvando: boolean;
  onSalvar: (valores: Record<string, string>) => void;
}) => {
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(campos.map((c) => [c.chave, c.valor])),
  );
  const mudou = campos.some((c) => (valores[c.chave] ?? "") !== c.valor);
  const falta = campos.some((c) => c.obrigatorio && !(valores[c.chave] ?? "").trim());
  return (
    <section className={`${card} flex flex-col gap-3 p-4`}>
      <Eyebrow className="text-farol-accent">{titulo}</Eyebrow>
      {campos.map((c) => (
        <Rotulo key={c.chave} texto={c.rotulo} ajuda={c.ajuda}>
          {c.longo ? (
            <textarea className={campo} rows={3} maxLength={400} value={valores[c.chave]} onChange={(e) => setValores({ ...valores, [c.chave]: e.target.value })} />
          ) : (
            <input className={campo} maxLength={120} value={valores[c.chave]} onChange={(e) => setValores({ ...valores, [c.chave]: e.target.value })} />
          )}
        </Rotulo>
      ))}
      {extra}
      {mudou && (
        <Button
          className="!py-2.5 text-sm"
          disabled={salvando || falta}
          onClick={() => onSalvar(Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, v.trim()])))}
        >
          Salvar
        </Button>
      )}
    </section>
  );
};
