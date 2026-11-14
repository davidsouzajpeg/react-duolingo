import dayjs from "dayjs";
import { useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { allLessons } from "~/farol/content";
import { weekKeyOf } from "~/farol/gamification";
import { useFarolStore, xpThisWeek } from "~/farol/store";
import Conquistas from "~/pages/farol/conquistas";
import Trilha from "~/pages/farol/index";
import Licao from "~/pages/farol/licao/[id]";
import Loja from "~/pages/farol/loja";
import Ranking from "~/pages/farol/ranking";
import { getPath, navigate, subscribe } from "./shims/router-core";

// o visualizador de artefatos não mostra confirm(): aqui a confirmação é dispensada
window.confirm = () => true;

// links comuns (<a href="/farol/...">) também navegam dentro do artefato
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement | null)?.closest?.("a");
  const href = a?.getAttribute("href");
  if (href && href.startsWith("/farol") && !e.defaultPrevented) {
    e.preventDefault();
    navigate(href);
  }
});

const shift = (days: string[], by: number) =>
  days.map((d) => dayjs(d).subtract(by, "day").format("YYYY-MM-DD"));

/** Painel só do artefato: atalhos para testar o que depende de tempo ou de moedas */
const TestPanel = () => {
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const onboarded = useFarolStore((s) => s.onboarded);
  if (!onboarded) return null;
  const st = useFarolStore;
  const actions: [string, () => string][] = [
    ["+500 moedas", () => {
      st.setState({ coins: st.getState().coins + 500 });
      return "500 moedas adicionadas. Use na Loja.";
    }],
    ["Virar a semana", () => {
      const s = st.getState();
      const last = weekKeyOf(dayjs().subtract(7, "day"));
      const xp = xpThisWeek(s.xpByDate);
      st.setState({
        league: { ...s.league, week: last },
        xpByDate: { ...s.xpByDate, [last]: (s.xpByDate[last] ?? 0) + xp },
      });
      st.getState().syncLeague();
      navigate("/farol/ranking");
      return "Semana fechada com o seu XP atual. Veja o resultado da divisão.";
    }],
    ["Perder um dia", () => {
      const s = st.getState();
      if (s.activeDays.length === 0) return "Faça uma lição primeiro, para ter uma ofensiva.";
      const had = s.streakFreezes;
      st.setState({ activeDays: shift(s.activeDays, 2), frozenDays: shift(s.frozenDays, 2), freezeNotice: [] });
      st.getState().syncStreak();
      navigate("/farol");
      return had > 0
        ? "Um dia sem prática foi simulado: o bloqueio de ofensiva cobriu."
        : "Um dia sem prática foi simulado sem bloqueio: a ofensiva zerou.";
    }],
    ["Liberar lições", () => {
      const lessons = { ...st.getState().lessons };
      allLessons.slice(0, -1).forEach(({ lesson }) => {
        lessons[lesson.id] ??= { completions: 1, bestAccuracy: 1 };
      });
      st.setState({ lessons });
      navigate("/farol");
      return "Tudo concluído, menos o último desafio. Faça-o para ver os parabéns.";
    }],
    ["Recomeçar", () => {
      st.getState().reset();
      navigate("/farol");
      return "";
    }],
  ];
  return (
    <div className="tp">
      <button className="tp-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        Painel de teste {open ? "▴" : "▾"}
      </button>
      {open && (
        <div className="tp-body">
          <div className="tp-actions">
            {actions.map(([label, run]) => (
              <button key={label} onClick={() => setNote(run())}>
                {label}
              </button>
            ))}
          </div>
          {note && <p role="status">{note}</p>}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const path = useSyncExternalStore(subscribe, getPath, getPath);
  const inLesson = path.startsWith("/farol/licao/");
  const Page = inLesson
    ? Licao
    : path === "/farol/ranking"
      ? Ranking
      : path === "/farol/loja"
        ? Loja
        : path === "/farol/conquistas"
          ? Conquistas
          : Trilha;
  return (
    <>
      {!inLesson && <TestPanel />}
      <Page />
    </>
  );
};

createRoot(document.getElementById("vende-root")!).render(<App />);
