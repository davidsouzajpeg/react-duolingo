import { useId } from "react";
import type { AvatarConfig } from "../shop";

const INK = "#1b1c20";

const Background = ({ id, gid }: { id?: string; gid: string }) => {
  switch (id) {
    case "fundo-verde":
      return <rect width="120" height="120" fill="#1b3a2b" />;
    case "fundo-rosa":
      return <rect width="120" height="120" fill="#ff0084" />;
    case "fundo-feixe":
      return (
        <>
          <rect width="120" height="120" fill="#121317" />
          <path d="M60 60 0 18v44Z" fill="#ff0084" opacity=".55" />
          <path d="M60 60 120 6v40Z" fill="#ff0084" opacity=".35" />
          <path d="M60 60 96 120H60Z" fill="#ff0084" opacity=".2" />
        </>
      );
    case "fundo-ouro":
      return (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="1" stopColor="#b9841c" />
            </linearGradient>
          </defs>
          <rect width="120" height="120" fill={`url(#${gid})`} />
        </>
      );
    default:
      return <rect width="120" height="120" fill="#2d2f36" />;
  }
};

const HairBack = ({ style, color }: { style: string; color: string }) =>
  style === "longo" ? (
    <path d="M33 52C30 18 90 18 87 52l2 40H71V58H49v34H31Z" fill={color} />
  ) : null;

const HairFront = ({ style, color }: { style: string; color: string }) => {
  const cap = (
    <path d="M37 52C34 24 86 24 83 52c-4-8-12-11-23-11S41 44 37 52Z" fill={color} />
  );
  switch (style) {
    case "curto":
    case "longo":
      return cap;
    case "coque":
      return (
        <>
          <circle cx="60" cy="22" r="10" fill={color} />
          {cap}
        </>
      );
    case "cacheado":
      return (
        <g fill={color}>
          <circle cx="40" cy="46" r="9" />
          <circle cx="45" cy="35" r="10" />
          <circle cx="56" cy="29" r="11" />
          <circle cx="68" cy="30" r="11" />
          <circle cx="77" cy="37" r="10" />
          <circle cx="81" cy="47" r="8" />
        </g>
      );
    default:
      return null;
  }
};

const Hat = ({ id }: { id?: string }) => {
  switch (id) {
    case "bone":
      return (
        <>
          <path d="M36 42C36 16 84 16 84 42Z" fill="#ff0084" />
          <path d="M34 40h62a4 4 0 0 1 0 8H34Z" fill="#c4006a" />
          <circle cx="60" cy="21" r="3" fill="#c4006a" />
        </>
      );
    case "capacete":
      return (
        <>
          <path d="M33 44C33 12 87 12 87 44Z" fill="#f5b331" />
          <rect x="56" y="17" width="8" height="27" rx="3" fill="#b9841c" />
          <rect x="28" y="41" width="64" height="8" rx="4" fill="#b9841c" />
        </>
      );
    case "coroa":
      return (
        <>
          <path d="M38 40 42 16l10 13 8-17 8 17 10-13 4 24Z" fill="#f5b331" stroke="#b9841c" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="60" cy="31" r="3" fill="#ff0084" />
          <circle cx="47" cy="33" r="2" fill="#3fcf86" />
          <circle cx="73" cy="33" r="2" fill="#3fcf86" />
        </>
      );
    default:
      return null;
  }
};

const Glasses = ({ id }: { id?: string }) => {
  switch (id) {
    case "oculos-redondo":
      return (
        <g fill="rgba(255,255,255,.18)" stroke={INK} strokeWidth="2.5">
          <circle cx="50" cy="56" r="7.5" />
          <circle cx="70" cy="56" r="7.5" />
          <path d="M57.5 56h5" fill="none" />
        </g>
      );
    case "oculos-escuro":
      return (
        <g fill={INK}>
          <rect x="41" y="50" width="17" height="12" rx="5" />
          <rect x="62" y="50" width="17" height="12" rx="5" />
          <rect x="56" y="53" width="8" height="3" />
        </g>
      );
    default:
      return null;
  }
};

const Accessory = ({ id }: { id?: string }) => {
  switch (id) {
    case "gravata":
      return <path d="m60 88-5 6 5 24 5-24Z" fill={INK} stroke="#fff" strokeWidth="1" />;
    case "cracha":
      return (
        <>
          <path d="M49 88 58 105M71 88 62 105" stroke={INK} strokeWidth="2" fill="none" />
          <rect x="52" y="103" width="16" height="13" rx="2" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <rect x="52" y="103" width="16" height="4" rx="2" fill="#ff0084" />
        </>
      );
    case "headset":
      return (
        <>
          <path d="M36 58C34 18 86 18 84 58" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="30" y="50" width="9" height="16" rx="4" fill={INK} />
          <rect x="81" y="50" width="9" height="16" rx="4" fill={INK} />
          <path d="M34 66c1 10 8 12 17 11" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="77" r="3" fill="#ff0084" />
        </>
      );
    default:
      return null;
  }
};

/** Avatar do vendedor: desenho original em camadas, montado a partir da configuração */
export const Avatar = ({
  config,
  className = "h-12 w-12",
  label = "Seu avatar",
}: {
  config: AvatarConfig;
  className?: string;
  label?: string;
}) => {
  const uid = useId().replace(/:/g, "");
  const clip = `av-clip-${uid}`;
  const { equipped } = config;
  // com chapéu, o cabelo de cima fica escondido (menos o comprido atrás)
  const hat = equipped.chapeu;
  return (
    <svg viewBox="0 0 120 120" className={`shrink-0 ${className}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <Background id={equipped.fundo} gid={`av-g-${uid}`} />
        <HairBack style={config.hair} color={config.hairColor} />
        {/* corpo */}
        <path d="M18 122c0-24 20-36 42-36s42 12 42 36Z" fill={config.shirt} />
        <path d="M52 74h16v14c0 5-16 5-16 0Z" fill={config.skin} />
        <path d="M52 80c5 4 11 4 16 0v4c-5 4-11 4-16 0Z" fill="#000" opacity=".12" />
        {/* cabeça */}
        <circle cx="37" cy="58" r="5" fill={config.skin} />
        <circle cx="83" cy="58" r="5" fill={config.skin} />
        <ellipse cx="60" cy="55" rx="23" ry="26" fill={config.skin} />
        {!hat && <HairFront style={config.hair} color={config.hairColor} />}
        {hat && config.hair !== "careca" && (
          <path d="M37 54c-1-6 0-10 2-13h42c2 3 3 7 2 13-1-4-3-7-5-9H42c-2 2-4 5-5 9Z" fill={config.hairColor} />
        )}
        {/* rosto */}
        <circle cx="50" cy="56" r="2.8" fill={INK} />
        <circle cx="70" cy="56" r="2.8" fill={INK} />
        <path d="M51 66c4 6 14 6 18 0" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <Glasses id={equipped.oculos} />
        <Hat id={hat} />
        <Accessory id={equipped.acessorio} />
      </g>
    </svg>
  );
};
