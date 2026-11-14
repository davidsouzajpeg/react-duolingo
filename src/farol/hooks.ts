import { useEffect, useState } from "react";
import { notifyGestorTrailCompleted } from "./notify";
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

export const useStreak = () => computeStreak(useFarolStore((s) => s.activeDays));

/** Mantém as vidas regenerando enquanto a página está aberta */
export const useHeartRegen = () => {
  const syncHearts = useFarolStore((s) => s.syncHearts);
  useEffect(() => {
    syncHearts();
    const id = setInterval(syncHearts, 30_000);
    return () => clearInterval(id);
  }, [syncHearts]);
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

let audioCtx: AudioContext | null = null;

const playNotes = (notes: [number, number][], type: OscillatorType) => {
  if (typeof window === "undefined") return;
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    let t = ctx.currentTime;
    for (const [freq, dur] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.8;
    }
  } catch {
    // áudio indisponível: segue sem som
  }
};

export const useSounds = () => {
  const soundOn = useFarolStore((s) => s.soundOn);
  return {
    correct: () =>
      soundOn &&
      playNotes(
        [
          [660, 0.12],
          [880, 0.2],
        ],
        "sine",
      ),
    wrong: () =>
      soundOn &&
      playNotes(
        [
          [220, 0.15],
          [180, 0.25],
        ],
        "triangle",
      ),
    finish: () =>
      soundOn &&
      playNotes(
        [
          [523, 0.12],
          [659, 0.12],
          [784, 0.12],
          [1047, 0.35],
        ],
        "sine",
      ),
  };
};
