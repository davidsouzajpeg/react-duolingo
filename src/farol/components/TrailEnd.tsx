import dayjs from "dayjs";
import Link from "next/link";
import { allLessons, linhaAtual } from "../content";
import { completedLessonCount } from "../gamification";
import { useStreak } from "../hooks";
import { useFarolStore } from "../store";
import {
  Eyebrow,
  Faroldo,
  Feixe,
  Pill,
  Semaforo,
  buttonBase,
  buttonVariants,
  card,
} from "./ui";

export const NOVOS_MODULOS =
  "Em breve o seu gestor irá liberar novos módulos para você.";

/** Situação do aviso de conclusão enviado ao gestor */
export const GestorNoticePill = ({ className = "" }: { className?: string }) => {
  const notice = useFarolStore((s) => s.gestorNotice);
  return notice.status === "enviado" ? (
    <Pill tone="verde" className={className}>
      ✓ Gestor avisado em {dayjs(notice.sentAt).format("DD/MM")}
    </Pill>
  ) : (
    <Pill tone="amarelo" className={className}>
      ● Aviso ao gestor pendente
    </Pill>
  );
};

const Total = ({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) => (
  <div className="rounded-xl border border-farol-line bg-farol-bg/60 px-2 py-3 text-center">
    <p className={`font-num text-2xl font-black tabular-nums leading-none ${tone}`}>{value}</p>
    <p className="mt-1.5 text-[11px] font-semibold uppercase leading-tight tracking-[.07em] text-farol-muted">
      {label}
    </p>
  </div>
);

const Totals = () => {
  const xpTotal = useFarolStore((s) => s.xpTotal);
  const lessons = useFarolStore((s) => s.lessons);
  const stats = useFarolStore((s) => s.stats);
  const streak = useStreak();
  const accuracy = stats.answered
    ? Math.round((stats.correct / stats.answered) * 100)
    : 0;
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
      <Total label="XP total" value={xpTotal} tone="text-farol-accent" />
      <Total label="Lições" value={`${completedLessonCount(lessons)}/${allLessons.length}`} />
      <Total label="Precisão geral" value={`${accuracy}%`} tone="text-farol-ok" />
      <Total label={streak === 1 ? "Dia de sequência" : "Dias de sequência"} value={streak} tone="text-farol-warn" />
    </div>
  );
};

/** Tela cheia de comemoração, logo depois do resumo da última lição */
export const Parabens = () => {
  const name = useFarolStore((s) => s.name);
  const sent = useFarolStore((s) => s.gestorNotice.status === "enviado");
  return (
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden px-4 py-8 text-center sm:py-10">
      <Feixe className="-top-48 left-1/2 -ml-[17rem] h-[34rem] w-[34rem]" />
      <div className="relative flex grow flex-col items-center justify-center gap-5">
        <div className="flex items-end gap-4">
          <Semaforo sinal="verde" size="lg" />
          <Faroldo className="h-20 w-20" mood="feliz" />
        </div>
        <div>
          <Eyebrow className="text-farol-accent">
            Linha {linhaAtual.title} concluída
          </Eyebrow>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            Parabéns{name ? `, ${name}` : ""}!
          </h1>
          <p className="mt-3 text-farol-muted">
            Você evoluiu! Concluiu todas as unidades da trilha. Hora de colocar esse aprendizado em prática.
          </p>
        </div>

        <Totals />

        <div className={`${card} w-full p-4 text-left`}>
          <div className="flex items-start gap-3">
            <Faroldo className="h-11 w-11" mood="feliz" />
            <div className="min-w-0">
              <Eyebrow className="text-farol-accent">Faroldo diz</Eyebrow>
              <p className="mt-0.5 font-semibold">{NOVOS_MODULOS}</p>
              <p className="mt-1 text-sm text-farol-muted" role="status">
                {sent
                  ? "Seu gestor já foi avisado da sua conclusão."
                  : "Vamos avisar o seu gestor assim que houver conexão."}
              </p>
            </div>
          </div>
          <GestorNoticePill className="mt-3" />
        </div>
      </div>
      <Link href="/farol" className={`relative mt-8 ${buttonBase} ${buttonVariants.primary}`}>
        Voltar para a trilha
      </Link>
    </div>
  );
};

/** Cartão fixo no fim da trilha enquanto todas as lições estiverem concluídas */
export const TrailEndCard = () => (
  <section
    className={`${card} relative overflow-hidden border-farol-ok/50 p-5 sm:p-6`}
    aria-label="Trilha concluída"
  >
    <Feixe className="-bottom-32 -right-28 h-80 w-80" />
    <div className="relative">
      <div className="flex items-center gap-4">
        <Semaforo sinal="verde" size="sm" />
        <div className="min-w-0">
          <Eyebrow className="text-farol-ok">Trilha concluída</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">
            Parabéns! Você concluiu a linha {linhaAtual.title}.
          </h2>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <Faroldo className="h-11 w-11" mood="feliz" />
        <div className="min-w-0">
          <p className="font-semibold">{NOVOS_MODULOS}</p>
          <p className="mt-1 text-sm text-farol-muted">
            Enquanto isso, as lições continuam abertas para você praticar.
          </p>
        </div>
      </div>
      <GestorNoticePill className="mt-4" />
    </div>
  </section>
);
