import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { ApiError, useConta } from "~/farol/conta";
import { Brand, Button, Eyebrow, Faroldo, Feixe, card } from "./ui";

const campo =
  "w-full rounded-2xl border border-farol-line bg-farol-bg px-4 py-3 text-base text-farol-ink outline-none transition placeholder:text-farol-muted focus:border-farol-accent";

const Moldura = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center overflow-hidden px-4 py-10">
    <Feixe className="-top-40 left-1/2 -ml-56 h-[28rem] w-[28rem]" />
    <div aria-hidden className="vd-aura vd-aura-rosa right-[-30%] top-[10%] h-72 w-72" />
    <div className="vd-stagger relative flex flex-col gap-6">{children}</div>
  </div>
);

const mensagemDe = (e: unknown) =>
  e instanceof ApiError ? e.message : "Algo deu errado. Tente de novo.";

const Login = () => {
  const entrar = useConta((s) => s.entrar);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setErro("");
    setEnviando(true);
    entrar(usuario, senha)
      .catch((err) => setErro(mensagemDe(err)))
      .finally(() => setEnviando(false));
  };

  return (
    <Moldura>
      <Brand />
      <div>
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">Bora vendê?</h1>
        <p className="mt-2 text-farol-muted">Entre com o usuário que o seu gestor criou para você.</p>
      </div>
      <form onSubmit={enviar} className={`${card} flex flex-col gap-4 p-5`}>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Usuário</Eyebrow>
          <input
            className={campo}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            spellCheck={false}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Eyebrow>Senha</Eyebrow>
          <input
            className={campo}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {erro && (
          <p role="alert" className="rounded-xl bg-farol-bad-soft px-4 py-3 text-sm font-semibold text-farol-bad">
            {erro}
          </p>
        )}
        <Button type="submit" disabled={enviando || !usuario || !senha}>
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <p className="text-center text-sm text-farol-muted">
        Esqueceu a senha? Peça ao seu gestor para redefinir.
      </p>
    </Moldura>
  );
};

/** formulário de senha nova: usado no primeiro acesso e no Perfil */
export const TrocarSenhaForm = ({
  primeiroAcesso = false,
  onDone,
}: {
  primeiroAcesso?: boolean;
  onDone?: () => void;
}) => {
  const trocarSenha = useConta((s) => s.trocarSenha);
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [repete, setRepete] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (nova !== repete) return setErro("As duas senhas novas não são iguais.");
    setErro("");
    setEnviando(true);
    trocarSenha(atual, nova)
      .then(() => onDone?.())
      .catch((err) => setErro(mensagemDe(err)))
      .finally(() => setEnviando(false));
  };

  return (
    <form onSubmit={enviar} className={`${card} flex flex-col gap-4 p-5`}>
      <label className="flex flex-col gap-1.5">
        <Eyebrow>{primeiroAcesso ? "Senha que você recebeu" : "Senha atual"}</Eyebrow>
        <input className={campo} type="password" value={atual} onChange={(e) => setAtual(e.target.value)} autoComplete="current-password" required />
      </label>
      <label className="flex flex-col gap-1.5">
        <Eyebrow>Senha nova</Eyebrow>
        <input className={campo} type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" minLength={6} required />
        <span className="text-xs text-farol-muted">Pelo menos 6 caracteres.</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <Eyebrow>Repita a senha nova</Eyebrow>
        <input className={campo} type="password" value={repete} onChange={(e) => setRepete(e.target.value)} autoComplete="new-password" required />
      </label>
      {erro && (
        <p role="alert" className="rounded-xl bg-farol-bad-soft px-4 py-3 text-sm font-semibold text-farol-bad">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={enviando || !atual || !nova || !repete}>
        {enviando ? "Salvando…" : "Salvar senha"}
      </Button>
    </form>
  );
};

const PrimeiroAcesso = () => {
  const usuario = useConta((s) => s.usuario);
  const sair = useConta((s) => s.sair);
  return (
    <Moldura>
      <Brand />
      <div className="flex items-start gap-3">
        <Faroldo className="h-14 w-14" mood="feliz" />
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight">
            Oi, {usuario?.nome.split(" ")[0]}! Crie a sua senha
          </h1>
          <p className="mt-1 text-farol-muted">
            É o seu primeiro acesso. Troque a senha inicial por uma só sua para começar.
          </p>
        </div>
      </div>
      <TrocarSenhaForm primeiroAcesso />
      <button onClick={() => void sair()} className="self-center text-sm font-semibold text-farol-muted hover:text-farol-ink">
        Entrar com outro usuário
      </button>
    </Moldura>
  );
};

/** Porta de entrada: sem conta ligada, mostra o app direto */
export const Acesso = ({ children }: { children: ReactNode }) => {
  const status = useConta((s) => s.status);
  const iniciar = useConta((s) => s.iniciar);
  useEffect(() => void iniciar(), [iniciar]);

  if (status === "desligada" || status === "dentro") return <>{children}</>;
  if (status === "fora") return <Login />;
  if (status === "trocar") return <PrimeiroAcesso />;
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Carregando">
      <span className="vd-twinkle">
        <Brand />
      </span>
    </div>
  );
};
