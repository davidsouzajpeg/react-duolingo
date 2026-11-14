import Head from "next/head";
import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";

/* ------------------------------ Casca / tema ------------------------------ */

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@600;800&family=IBM+Plex+Sans:wght@400;500;600&family=Nunito:wght@700;800;900&display=swap";

const BG = "#1b1c20";

/**
 * Casca visual do módulo: aplica o tema escuro do Meu Farol (tokens em
 * tailwind.config.ts → colors.farol) somente nas páginas /farol.
 */
export const FarolShell = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  // fundo do <body> escuro só enquanto uma página do Farol está aberta
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = BG;
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{`${title} · Meu Farol Treino`}</title>
        <meta name="theme-color" content={BG} key="theme-color" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
      </Head>
      <div className="min-h-screen overflow-x-clip bg-farol-bg font-body text-farol-ink antialiased [color-scheme:dark]">
        {children}
      </div>
    </>
  );
};

/** Logo Open + nome do produto */
export const Brand = ({ compact = false }: { compact?: boolean }) => (
  <span className="flex items-center gap-2.5">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/farol/logo-open.png"
      alt="Open"
      width={360}
      height={118}
      className={`w-auto shrink-0 ${compact ? "h-7" : "h-8"}`}
    />
    <span className={`flex-col leading-none ${compact ? "hidden min-[360px]:flex" : "flex"}`}>
      <b className="whitespace-nowrap font-display text-[17px] font-extrabold tracking-tight">
        Meu Farol
      </b>
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-[.14em] text-farol-accent">
        Treino
      </span>
    </span>
  </span>
);

export const Eyebrow = ({
  children,
  className = "text-farol-muted",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={`text-xs font-semibold uppercase tracking-[.09em] ${className}`}>
    {children}
  </p>
);

/** Cartão padrão: superfície + linha de 1px */
export const card = "rounded-2xl border border-farol-line bg-farol-surface";

/** Feixe do farol: cone rosa girando (use dentro de um pai `relative overflow-hidden`) */
export const Feixe = ({ className = "-right-28 -top-28 h-80 w-80" }: { className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute animate-farol-feixe rounded-full motion-reduce:animate-none ${className}`}
    style={{
      background:
        "conic-gradient(from 0deg, rgba(255,0,132,.5), rgba(255,0,132,0) 55deg, rgba(255,0,132,0) 180deg, rgba(255,0,132,.28) 205deg, rgba(255,0,132,0) 250deg)",
      WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 70%)",
      maskImage: "radial-gradient(circle, #000 0%, transparent 70%)",
    }}
  />
);

/* -------------------------------- Semáforo -------------------------------- */

export type Sinal = "verde" | "amarelo" | "vermelho";

/** Farol da lição: verde ≥ 90% de precisão, amarelo ≥ 70%, vermelho abaixo */
export const sinalDaPrecisao = (accuracy: number): Sinal =>
  accuracy >= 0.9 ? "verde" : accuracy >= 0.7 ? "amarelo" : "vermelho";

export const sinalInfo: Record<
  Sinal,
  { label: string; hex: string; text: string; pill: string }
> = {
  verde: {
    label: "Farol verde",
    hex: "#3fcf86",
    text: "text-farol-ok",
    pill: "bg-farol-ok-soft text-farol-ok",
  },
  amarelo: {
    label: "Farol amarelo",
    hex: "#f5b331",
    text: "text-farol-warn",
    pill: "bg-farol-warn-soft text-farol-warn",
  },
  vermelho: {
    label: "Farol vermelho",
    hex: "#ff5a4f",
    text: "text-farol-bad",
    pill: "bg-farol-bad-soft text-farol-bad",
  },
};

const lampOrder: Sinal[] = ["vermelho", "amarelo", "verde"];

const semaforoSizes = {
  xs: { lamp: "h-2.5 w-2.5", box: "gap-1 p-1", glow: 6 },
  sm: { lamp: "h-4 w-4", box: "gap-1.5 p-1.5", glow: 10 },
  lg: { lamp: "h-11 w-11", box: "gap-3 p-3.5", glow: 26 },
};

/** Semáforo do Meu Farol: três lâmpadas numa cápsula escura; a acesa brilha */
export const Semaforo = ({
  sinal,
  size = "sm",
  horizontal = false,
  className = "",
}: {
  sinal: Sinal | null;
  size?: keyof typeof semaforoSizes;
  horizontal?: boolean;
  className?: string;
}) => {
  const s = semaforoSizes[size];
  return (
    <span
      role="img"
      aria-label={sinal ? sinalInfo[sinal].label : "Farol apagado"}
      className={`inline-flex shrink-0 rounded-full border border-farol-line bg-farol-lamp ${
        horizontal ? "flex-row" : "flex-col"
      } ${s.box} ${className}`}
    >
      {lampOrder.map((lamp) => {
        const lit = lamp === sinal;
        const hex = sinalInfo[lamp].hex;
        return (
          <span
            key={lamp}
            className={`rounded-full transition-all duration-500 ${s.lamp}`}
            style={
              lit
                ? {
                    backgroundColor: hex,
                    boxShadow: `0 0 ${s.glow}px ${hex}, 0 0 ${s.glow * 2.2}px ${hex}66`,
                  }
                : { backgroundColor: hex, opacity: 0.16 }
            }
          />
        );
      })}
    </span>
  );
};

export const Pill = ({
  tone,
  children,
  className = "",
}: {
  tone: Sinal | "rosa" | "neutro";
  children: ReactNode;
  className?: string;
}) => {
  const tones = {
    verde: sinalInfo.verde.pill,
    amarelo: sinalInfo.amarelo.pill,
    vermelho: sinalInfo.vermelho.pill,
    rosa: "bg-farol-accent-soft text-farol-accent",
    neutro: "bg-farol-surface2 text-farol-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

/* --------------------------------- Faroldo -------------------------------- */

/** Faroldo, o coach do Meu Farol: a lanterna do farol com o feixe aceso */
export const Faroldo = ({
  className = "h-12 w-12",
  mood = "neutro",
}: {
  className?: string;
  mood?: "neutro" | "feliz" | "atento";
}) => {
  const light = mood === "feliz" ? "#3fcf86" : mood === "atento" ? "#f5b331" : "#ff0084";
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} role="img" aria-label="Faroldo">
      <circle cx="24" cy="24" r="24" fill="#121317" />
      <path d="M24 20 2 9v22l22-11Z" fill={light} opacity=".22" />
      <path d="M24 20 46 9v22L24 20Z" fill={light} opacity=".22" />
      <path d="M16 12.5h16L29.5 8h-11L16 12.5Z" fill="#ff0084" />
      <rect x="15" y="12.5" width="18" height="15" rx="3" fill="#ffffff" />
      <circle cx="20.5" cy="19" r="2" fill="#121317" />
      <circle cx="27.5" cy="19" r="2" fill="#121317" />
      {mood === "atento" ? (
        <path d="M21 24h6" stroke="#121317" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M20.5 23c1 1.6 6 1.6 7 0" stroke="#121317" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      )}
      <path d="M17 27.5h14l2.5 16.5h-19L17 27.5Z" fill="#2d2f36" />
      <path d="M16.2 33h15.6l.7 5H15.5l.7-5Z" fill="#ff0084" />
    </svg>
  );
};

/* ---------------------------- Barra e botões ------------------------------ */

export const ProgressBar = ({
  value,
  color = "#ff0084",
  className = "h-3",
}: {
  value: number;
  color?: string;
  className?: string;
}) => (
  <div
    className={`w-full overflow-hidden rounded-full bg-farol-surface2 ${className}`}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(Math.max(0, Math.min(1, value)) * 100)}
  >
    <div
      className="relative h-full rounded-full transition-all duration-500"
      style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        backgroundColor: color,
      }}
    >
      <div className="absolute left-2 right-2 top-[20%] h-[25%] rounded-full bg-white/25" />
    </div>
  </div>
);

type ButtonVariant = "primary" | "success" | "danger" | "ghost";

/** Botões "gordinhos" (borda inferior grossa) nas cores do Meu Farol */
export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "border-b-4 border-farol-accent-dark bg-farol-accent text-white",
  success: "border-b-4 border-farol-ok-dark bg-farol-ok text-farol-lamp",
  danger: "border-b-4 border-farol-bad-dark bg-farol-bad text-white",
  ghost:
    "border-2 border-b-4 border-farol-accent bg-transparent text-farol-accent hover:bg-farol-accent-soft",
};

export const buttonBase =
  "rounded-2xl px-6 py-3 text-center font-display font-extrabold uppercase tracking-wide transition hover:brightness-110 active:translate-y-0.5 active:border-b-2";

export const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) => (
  <button
    className={`${buttonBase} disabled:cursor-not-allowed disabled:border-farol-line disabled:bg-farol-surface2 disabled:text-farol-muted disabled:hover:brightness-100 disabled:active:translate-y-0 disabled:active:border-b-4 ${buttonVariants[variant]} ${className}`}
    {...props}
  />
);
