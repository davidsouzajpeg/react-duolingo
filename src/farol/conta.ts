/**
 * CONTA — login e progresso salvo no servidor
 *
 * Ligado quando `NEXT_PUBLIC_VENDE_API` aponta para a API (servidor/api).
 * Sem essa variável (ambiente de demonstração), o app funciona como antes:
 * sem login e com o progresso só no navegador.
 *
 * O progresso continua sendo guardado também no navegador, como cópia
 * rápida; a versão do servidor é a que vale ao entrar.
 */
import { create } from "zustand";
import { useFarolStore } from "./store";

const API = process.env.NEXT_PUBLIC_VENDE_API ?? "";
export const contaAtiva = API !== "";

export type Usuario = {
  id: number;
  usuario: string;
  nome: string;
  papel: "vendedor" | "gestor";
  trocarSenha: boolean;
};

export class ApiError extends Error {
  constructor(public status: number, public codigo: string, message: string) {
    super(message);
  }
}

export const api = async <T,>(rota: string, corpo?: unknown): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(`${API}?r=${rota}`, {
      method: corpo === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers: corpo === undefined ? undefined : { "Content-Type": "application/json", "X-Vende": "1" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      keepalive: corpo !== undefined,
    });
  } catch {
    throw new ApiError(0, "rede", "Sem conexão com o servidor. Confira a internet e tente de novo.");
  }
  const dados = (await res.json().catch(() => ({}))) as { erro?: string; mensagem?: string };
  if (!res.ok) throw new ApiError(res.status, dados.erro ?? "erro", dados.mensagem ?? "Algo deu errado.");
  return dados as T;
};

/* ------------------------------ Cópia local -------------------------------- */

const DONO = "vende-dono"; // de quem é o progresso guardado neste navegador
const CONTA = "vende-conta"; // último usuário, para abrir sem internet

const ler = (chave: string) => {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
};
const gravar = (chave: string, valor: string | null) => {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    /* navegador sem armazenamento: segue só com o servidor */
  }
};

/* ------------------------------ Sincronização ------------------------------ */

/** só os dados (sem as funções da store) */
const retrato = () => JSON.parse(JSON.stringify(useFarolStore.getState())) as Record<string, unknown>;

let parar: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let pendente = false;

const enviar = async () => {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!pendente) return;
  pendente = false;
  const versao = useFarolStore.persist.getOptions().version ?? 0;
  try {
    await api("progresso", { estado: { ...retrato(), _versao: versao } });
    useConta.setState({ salvoEm: Date.now(), erroSync: false });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      // sessão encerrada (senha redefinida, por exemplo): volta para o login
      pararSync();
      useConta.setState({ status: "fora", usuario: null });
      return;
    }
    pendente = true; // tenta de novo na próxima mudança ou quando a conexão voltar
    useConta.setState({ erroSync: true });
  }
};

const agendar = () => {
  pendente = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void enviar(), 1500);
};

const aoEsconder = () => {
  if (document.visibilityState === "hidden") void enviar();
};
const aoVoltar = () => void enviar();

const pararSync = () => {
  parar?.();
  parar = null;
  if (timer) clearTimeout(timer);
  timer = null;
  pendente = false;
  document.removeEventListener("visibilitychange", aoEsconder);
  window.removeEventListener("pagehide", aoVoltar);
  window.removeEventListener("online", aoVoltar);
};

const iniciarSync = () => {
  pararSync();
  parar = useFarolStore.subscribe(agendar);
  document.addEventListener("visibilitychange", aoEsconder);
  window.addEventListener("pagehide", aoVoltar);
  window.addEventListener("online", aoVoltar);
};

/** traz o progresso do servidor para o app (ou sobe o local, no primeiro acesso) */
const carregarProgresso = async (usuario: Usuario) => {
  const dono = ler(DONO);
  const { estado } = await api<{ estado: (Record<string, unknown> & { _versao?: number }) | null }>("progresso");
  const store = useFarolStore;

  if (estado) {
    const { _versao = 0, ...dados } = estado;
    const opts = store.persist.getOptions();
    const migrado =
      opts.migrate && _versao < (opts.version ?? 0)
        ? ((await opts.migrate(dados, _versao)) as Record<string, unknown>)
        : dados;
    store.getState().reset();
    store.setState(migrado);
  } else if (dono !== null && dono !== String(usuario.id)) {
    // o progresso deste navegador é de outra pessoa: começa do zero
    store.getState().reset();
  }
  // sem progresso no servidor e navegador "sem dono" (ou do próprio usuário):
  // aproveita o que já existe aqui e envia logo abaixo

  if (!store.getState().name) store.setState({ name: usuario.nome.split(" ")[0] ?? usuario.nome });
  gravar(DONO, String(usuario.id));
  iniciarSync();
  if (!estado) agendar();
};

/* --------------------------------- Estado ---------------------------------- */

type ContaState = {
  /** desligada: app sem login · carregando · fora: pede login · trocar: senha nova · dentro */
  status: "desligada" | "carregando" | "fora" | "trocar" | "dentro";
  usuario: Usuario | null;
  semInternet: boolean;
  salvoEm: number | null;
  erroSync: boolean;
  iniciar: () => Promise<void>;
  entrar: (usuario: string, senha: string) => Promise<void>;
  trocarSenha: (atual: string, nova: string) => Promise<void>;
  sair: () => Promise<void>;
};

const aposEntrar = async (usuario: Usuario) => {
  gravar(CONTA, JSON.stringify(usuario));
  if (usuario.trocarSenha) {
    useConta.setState({ status: "trocar", usuario });
    return;
  }
  await carregarProgresso(usuario);
  useConta.setState({ status: "dentro", usuario, semInternet: false });
};

export const useConta = create<ContaState>()((set, get) => ({
  status: contaAtiva ? "carregando" : "desligada",
  usuario: null,
  semInternet: false,
  salvoEm: null,
  erroSync: false,

  iniciar: async () => {
    if (!contaAtiva || get().status !== "carregando") return;
    try {
      const { usuario } = await api<{ usuario: Usuario | null }>("eu");
      if (!usuario) return set({ status: "fora", usuario: null });
      await aposEntrar(usuario);
    } catch (e) {
      // sem internet: quem já entrou neste aparelho continua treinando;
      // o progresso sobe quando a conexão voltar
      const guardado = ler(CONTA);
      const dono = ler(DONO);
      if (e instanceof ApiError && e.status === 0 && guardado && dono) {
        const usuario = JSON.parse(guardado) as Usuario;
        if (String(usuario.id) === dono && !usuario.trocarSenha) {
          iniciarSync();
          return set({ status: "dentro", usuario, semInternet: true });
        }
      }
      set({ status: "fora", usuario: null });
    }
  },

  entrar: async (usuario, senha) => {
    const r = await api<{ usuario: Usuario }>("entrar", { usuario, senha });
    await aposEntrar(r.usuario);
  },

  trocarSenha: async (atual, nova) => {
    const r = await api<{ usuario: Usuario }>("trocar-senha", { atual, nova });
    if (get().status === "trocar") await aposEntrar(r.usuario);
  },

  sair: async () => {
    await enviar();
    pararSync();
    await api("sair", {}).catch(() => undefined);
    gravar(CONTA, null);
    gravar(DONO, null);
    useFarolStore.getState().reset();
    set({ status: "fora", usuario: null, salvoEm: null, erroSync: false });
  },
}));
