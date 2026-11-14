import { useEffect, useState } from "react";
import { notifyGestorTrailCompleted } from "./notify";
import { sfx } from "./sounds";
import { computeStreak, useFarolStore } from "./store";

/**
 * O estado do Farol fica salvo no navegador (localStorage). Para evitar
 * diferenças entre o HTML do servidor e o do cliente, as páginas só mostram
 * os dados do usuário depois de montadas no navegador.
 */
export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
};

export const useStreak = () => {
  const activeDays = useFarolStore((s) => s.activeDays);
  const frozenDays = useFarolStore((s) => s.frozenDays);
  return computeStreak(activeDays, frozenDays);
};

/** Ao abrir o app: aplica bloqueios de ofensiva e fecha a semana da divisão */
export const useDailySync = () => {
  useEffect(() => {
    const { syncStreak, syncLeague } = useFarolStore.getState();
    syncStreak();
    syncLeague();
  }, []);
};

/**
 * Confere se a trilha foi concluída e tenta (re)enviar o aviso pendente ao
 * gestor: uma vez ao montar a página e quando a conexão volta.
 */
export const useGestorNoticeRetry = () => {
  useEffect(() => {
    const attempt = () => {
      useFarolStore.getState().syncTrailCompletion();
      void notifyGestorTrailCompleted();
    };
    attempt();
    window.addEventListener("online", attempt);
    return () => window.removeEventListener("online", attempt);
  }, []);
};

/* ---------------------------------- Sons ---------------------------------- */

type Sfx = typeof sfx;

const silent = Object.fromEntries(
  Object.keys(sfx).map((name) => [name, () => undefined]),
) as unknown as Sfx;

/** Sons do Vendê, respeitando a configuração "Efeitos sonoros" do vendedor */
export const useSounds = (): Sfx => {
  const soundOn = useFarolStore((s) => s.soundOn);
  return soundOn ? sfx : silent;
};
