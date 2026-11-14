import { TRAIL_VERSION, allLessons, linhaAtual } from "./content";
import { computeStreak, useFarolStore } from "./store";

/**
 * Aviso ao gestor: "o vendedor concluiu a trilha".
 *
 * O painel do gestor é o app Meu Farol (front + API PHP). Este módulo só faz
 * o lado do cliente; o contrato do servidor está em
 * docs/farol-integracao-gestor.md.
 *
 * POST {NEXT_PUBLIC_FAROL_API_URL}/treino.php   (credentials: "include")
 * { op: "trilha_concluida", vendedor, trilha, versao, concluidaEm,
 *   xpTotal, licoes, precisao, sequencia }
 */

export type TrailCompletedPayload = {
  op: "trilha_concluida";
  vendedor: string;
  trilha: string;
  versao: string;
  /** ISO 8601 */
  concluidaEm: string;
  xpTotal: number;
  licoes: number;
  /** precisão geral, 0–100 */
  precisao: number;
  /** dias de sequência */
  sequencia: number;
};

/** URL do endpoint, ou null se a variável de ambiente não foi configurada */
export const gestorEndpoint = (): string | null => {
  const base = (process.env.NEXT_PUBLIC_FAROL_API_URL ?? "").trim();
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/treino.php`;
};

export const buildTrailCompletedPayload = (): TrailCompletedPayload => {
  const s = useFarolStore.getState();
  return {
    op: "trilha_concluida",
    vendedor: s.name || "Consultor",
    trilha: linhaAtual.title,
    versao: s.gestorNotice.trailVersion || TRAIL_VERSION,
    concluidaEm: s.trailCompletedAt ?? new Date().toISOString(),
    xpTotal: s.xpTotal,
    licoes: allLessons.filter(({ lesson }) => s.lessons[lesson.id]?.completions)
      .length,
    precisao: s.stats.answered
      ? Math.round((s.stats.correct / s.stats.answered) * 100)
      : 0,
    sequencia: computeStreak(s.activeDays, s.frozenDays),
  };
};

let inFlight: Promise<void> | null = null;

/**
 * Envia o aviso se houver um pendente. Nunca lança erro para a interface:
 * se a variável não estiver configurada, se não houver conexão ou se o
 * servidor responder com erro, o aviso continua "pendente" e é tentado de
 * novo na próxima vez que uma página do treino abrir ou a conexão voltar.
 */
export const notifyGestorTrailCompleted = (): Promise<void> => {
  if (inFlight) return inFlight;
  inFlight = send().finally(() => {
    inFlight = null;
  });
  return inFlight;
};

const send = async (): Promise<void> => {
  try {
    const { gestorNotice, markGestorNotified } = useFarolStore.getState();
    if (gestorNotice.status !== "pendente") return;
    const url = gestorEndpoint();
    if (!url || typeof fetch === "undefined") return;

    const payload = buildTrailCompletedPayload();
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) markGestorNotified(payload.versao);
  } catch {
    // sem conexão ou bloqueado: fica pendente para a próxima tentativa
  }
};
