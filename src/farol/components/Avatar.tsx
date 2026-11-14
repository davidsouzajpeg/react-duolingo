import { useEffect, useId, useRef, useState } from "react";
import type { AvatarConfig } from "../shop";

const INK = "#22232a";

/** escurece (amt < 0) ou clareia (amt > 0) uma cor hex */
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const t = Math.abs(amt);
  const ch = (v: number) => Math.round(v + (target - v) * t);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const Background = ({ id, gid }: { id?: string; gid: string }) => {
  switch (id) {
    case "fundo-verde":
      return (
        <>
          <rect width="200" height="200" fill="#1f6a47" />
          <circle cx="100" cy="92" r="84" fill="#3fcf86" opacity=".35" />
        </>
      );
    case "fundo-rosa":
      return (
        <>
          <rect width="200" height="200" fill="#ff0084" />
          <circle cx="100" cy="92" r="84" fill="#fff" opacity=".16" />
        </>
      );
    case "fundo-feixe":
      return (
        <>
          <rect width="200" height="200" fill="#121317" />
          <path d="M100 96 0 24v78Z" fill="#ff0084" opacity=".6" />
          <path d="M100 96 200 6v70Z" fill="#ff0084" opacity=".4" />
          <path d="M100 96 150 200H96Z" fill="#ff0084" opacity=".22" />
          <path d="M100 96 20 200h40Z" fill="#ff0084" opacity=".14" />
        </>
      );
    case "fundo-ouro":
      return (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe9a3" />
              <stop offset="1" stopColor="#c08a1e" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill={`url(#${gid})`} />
          <path d="M0 150 200 40V0H150L0 90Z" fill="#fff" opacity=".18" />
        </>
      );
    default:
      return (
        <>
          <rect width="200" height="200" fill="#3a3c46" />
          <circle cx="100" cy="92" r="84" fill="#fff" opacity=".06" />
        </>
      );
  }
};

/** cabelo que fica atrás da cabeça e dos ombros */
const HairBack = ({ style, color }: { style: string; color: string }) => {
  switch (style) {
    case "longo":
      return (
        <path
          d="M38 96C30 22 170 22 162 96l6 78c-14 10-32 4-34-10V96H66v68c-2 14-20 20-34 10Z"
          fill={color}
        />
      );
    case "chanel":
      return (
        <path
          d="M40 92C34 24 166 24 160 92l4 40c-10 8-24 4-26-8V92H62v32c-2 12-16 16-26 8Z"
          fill={color}
        />
      );
    case "afro":
      return <ellipse cx="100" cy="72" rx="74" ry="64" fill={color} />;
    case "ondulado":
      return (
        <path
          d="M38 96C30 22 170 22 162 96c8 12-4 22 2 36-10 10-26 6-28-6V96H66v30c-2 12-18 16-28 6 6-14-6-24 0-36Z"
          fill={color}
        />
      );
    case "chiquinhas":
      return (
        <>
          <circle cx="36" cy="62" r="20" fill={color} />
          <circle cx="164" cy="62" r="20" fill={color} />
          <circle cx="50" cy="60" r="5" fill="#ff0084" />
          <circle cx="150" cy="60" r="5" fill="#ff0084" />
        </>
      );
    case "dreads":
      return (
        <g fill={color}>
          <rect x="34" y="50" width="11" height="104" rx="5.5" />
          <rect x="46" y="44" width="11" height="96" rx="5.5" />
          <rect x="143" y="44" width="11" height="96" rx="5.5" />
          <rect x="155" y="50" width="11" height="104" rx="5.5" />
        </g>
      );
    case "rabo":
      return (
        <>
          <path d="M140 52c34 0 44 52 26 96-8-22-16-44-30-62Z" fill={color} />
          <rect x="140" y="56" width="14" height="10" rx="5" fill="#ff0084" transform="rotate(35 147 61)" />
        </>
      );
    default:
      return null;
  }
};

const HairFront = ({ style, color }: { style: string; color: string }) => {
  const light = shade(color, 0.18);
  const cap = (
    <>
      <path d="M48 90C42 44 68 28 100 28s58 16 52 62c-6-22-22-32-52-32S54 68 48 90Z" fill={color} />
      <path d="M70 42c10-7 24-9 38-7" stroke={light} strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  );
  const buzz = (
    <path d="M50 86C46 46 70 33 100 33s54 13 50 53c-6-20-22-30-50-30S56 66 50 86Z" fill={color} opacity=".55" />
  );
  switch (style) {
    case "curto":
    case "longo":
    case "chanel":
    case "afro":
    case "rabo":
    case "ondulado":
    case "chiquinhas":
      return cap;
    case "lateral":
      return (
        <>
          <path d="M48 90C44 40 84 22 124 30c26 6 32 30 28 60-8-26-30-38-56-34-20 4-38 14-48 34Z" fill={color} />
          <path d="M70 44c16-10 36-12 54-6" stroke={light} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    case "militar":
      return (
        <>
          <path d="M50 88c-4-26 0-46 8-58h84c8 12 12 32 8 58-6-22-22-32-50-32S56 66 50 88Z" fill={color} />
          <path d="M66 36h44" stroke={light} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    case "entradas":
      return (
        <path d="M50 94c-4-26 2-42 12-50-2 16-2 32-4 44ZM150 94c4-26-2-42-12-50 2 16 2 32 4 44Z" fill={color} />
      );
    case "trancas":
      return (
        <>
          {cap}
          <g fill={color}>
            {[100, 116, 132, 148, 162].map((y, i) => (
              <g key={y}>
                <circle cx={50 + (i % 2) * 3} cy={y} r="9" />
                <circle cx={150 - (i % 2) * 3} cy={y} r="9" />
              </g>
            ))}
          </g>
          <circle cx="51" cy="174" r="5" fill="#ff0084" />
          <circle cx="149" cy="174" r="5" fill="#ff0084" />
        </>
      );
    case "dreads":
      return (
        <>
          {cap}
          <g fill={color}>
            {[58, 72, 86, 100, 114, 128].map((x) => (
              <rect key={x} x={x} y="28" width="11" height="38" rx="5.5" />
            ))}
          </g>
        </>
      );
    case "raspado":
      return buzz;
    case "moicano":
      return (
        <>
          {buzz}
          <path d="M86 62C80 14 120 14 114 62c-4-6-24-6-28 0Z" fill={color} />
          <path d="M94 30c3-5 8-6 12-3" stroke={light} strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    case "franja":
      return (
        <>
          {cap}
          <path d="M50 88c0-26 22-36 50-36s50 10 50 36c-12-10-24-14-36-14-6 6-16 6-22 0-14 0-28 4-42 14Z" fill={color} />
          <path d="M72 58c8-3 18-4 28-4" stroke={light} strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      );
    case "topete":
      return (
        <>
          {cap}
          <path d="M58 50c6-34 62-44 86-12-24-10-52-6-86 12Z" fill={color} />
          <path d="M78 32c14-9 34-10 50-2" stroke={light} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    case "coque":
      return (
        <>
          <circle cx="100" cy="22" r="19" fill={color} />
          <path d="M90 14c5-4 12-5 18-2" stroke={light} strokeWidth="4" strokeLinecap="round" fill="none" />
          {cap}
        </>
      );
    case "cacheado":
      return (
        <>
          <g fill={color}>
            <circle cx="54" cy="78" r="16" />
            <circle cx="60" cy="56" r="19" />
            <circle cx="80" cy="40" r="21" />
            <circle cx="106" cy="36" r="22" />
            <circle cx="130" cy="46" r="20" />
            <circle cx="144" cy="64" r="17" />
            <circle cx="148" cy="82" r="13" />
          </g>
          <g fill={light} opacity=".7">
            <circle cx="76" cy="34" r="5" />
            <circle cx="104" cy="28" r="5" />
            <circle cx="130" cy="40" r="4" />
          </g>
        </>
      );
    default:
      return null;
  }
};

const FacialHair = ({ style, color }: { style?: string; color: string }) => {
  const full =
    "M50 100c0 34 20 44 50 44s50-10 50-44c-4 16-12 22-24 22-8-12-44-12-52 0-12 0-20-6-24-22Z";
  switch (style) {
    case "barba":
      return <path d={full} fill={color} />;
    case "porfazer":
      return <path d={full} fill={color} opacity=".32" />;
    case "cavanhaque":
      return <path d="M80 118c0-12 40-12 40 0l-3 18c-8 10-26 10-34 0Z" fill={color} />;
    case "bigode":
      return <path d="M76 116c6-10 18-10 24-4 6-6 18-6 24 4-8 4-18 4-24-1-6 5-16 5-24 1Z" fill={color} />;
    case "bigodao":
      return <path d="M68 108c8 12 24 10 32 3 8 7 24 9 32-3-1 14-18 18-32 9-14 9-31 5-32-9Z" fill={color} />;
    case "mosca":
      return <ellipse cx="100" cy="138" rx="5" ry="6" fill={color} />;
    case "costeleta":
      return (
        <path d="M50 92c0 22 4 34 14 42-3-14-5-28-5-42ZM150 92c0 22-4 34-14 42 3-14 5-28 5-42Z" fill={color} />
      );
    case "longa":
      return (
        <>
          <path d={full} fill={color} />
          <path d="M62 128c4 46 72 46 76 0-14 14-62 14-76 0Z" fill={color} />
        </>
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
          <path d="M48 70C46 18 154 18 152 70Z" fill="#ff0084" />
          <path d="M62 40c10-12 26-17 42-15" stroke="#ff66b5" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M44 64h126a8 8 0 0 1 0 16H44Z" fill="#c4006a" />
          <circle cx="100" cy="26" r="6" fill="#c4006a" />
        </>
      );
    case "capacete":
      return (
        <>
          <path d="M42 76C38 10 162 10 158 76Z" fill="#f5b331" />
          <path d="M58 42c8-14 22-22 36-24" stroke="#ffd778" strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="92" y="16" width="16" height="58" rx="6" fill="#d99a1f" />
          <rect x="34" y="68" width="132" height="15" rx="7.5" fill="#b9841c" />
        </>
      );
    case "coroa":
      return (
        <>
          <path d="M56 66 62 20l20 24 18-32 18 32 20-24 6 46Z" fill="#f5b331" stroke="#b9841c" strokeWidth="4" strokeLinejoin="round" />
          <rect x="56" y="56" width="88" height="12" rx="4" fill="#b9841c" />
          <circle cx="100" cy="44" r="6" fill="#ff0084" />
          <circle cx="76" cy="48" r="4" fill="#3fcf86" />
          <circle cx="124" cy="48" r="4" fill="#3fcf86" />
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
        <g fill="rgba(255,255,255,.2)" stroke={INK} strokeWidth="4.5">
          <circle cx="79" cy="92" r="18" />
          <circle cx="121" cy="92" r="18" />
          <path d="M97 90q3-3 6 0" fill="none" strokeLinecap="round" />
        </g>
      );
    case "oculos-escuro":
      return (
        <>
          <g fill={INK}>
            <rect x="58" y="78" width="38" height="27" rx="11" />
            <rect x="104" y="78" width="38" height="27" rx="11" />
            <rect x="94" y="84" width="12" height="6" />
            <path d="M58 86 46 82v6l12 4ZM142 86l12-4v6l-12 4Z" />
          </g>
          <path d="M66 86l10 12M112 86l10 12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".35" />
        </>
      );
    default:
      return null;
  }
};

const Accessory = ({ id }: { id?: string }) => {
  switch (id) {
    case "gravata":
      return (
        <>
          <path d="m100 150-9 9 9 9 9-9Z" fill="#22232a" />
          <path d="m93 164-6 30 13 10 13-10-6-30-7 5Z" fill="#33343d" />
        </>
      );
    case "cracha":
      return (
        <>
          <path d="M76 150 100 184l24-34" stroke="#22232a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="85" y="178" width="30" height="26" rx="4" fill="#fff" stroke="#22232a" strokeWidth="3" />
          <rect x="85" y="178" width="30" height="8" rx="4" fill="#ff0084" />
          <circle cx="94" cy="194" r="3.5" fill="#a6a8b2" />
          <path d="M101 192h9M101 197h6" stroke="#a6a8b2" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case "headset":
      return (
        <>
          <path d="M42 98C36 18 164 18 158 98" stroke="#22232a" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="30" y="84" width="20" height="32" rx="9" fill="#22232a" />
          <rect x="150" y="84" width="20" height="32" rx="9" fill="#22232a" />
          <path d="M40 116c2 20 16 28 40 24" stroke="#22232a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="76" y="133" width="16" height="11" rx="5.5" fill="#ff0084" />
        </>
      );
    default:
      return null;
  }
};

const bodies = {
  magro: { w: 62, hw: 46, neck: 13 },
  medio: { w: 74, hw: 50, neck: 16 },
  forte: { w: 88, hw: 51, neck: 21 },
  gordo: { w: 90, hw: 57, neck: 21 },
} as const;

/** Roupa desenhada sobre o tronco. `w` é a meia largura dos ombros. */
const Outfit = ({
  type,
  w,
  color,
  dark,
  skin,
  skinDark,
  uid,
}: {
  type: string;
  w: number;
  color: string;
  dark: string;
  skin: string;
  skinDark: string;
  uid: string;
}) => {
  const L = 100 - w;
  const R = 100 + w;
  const torso = `M${L} 204c0-40 ${w * 0.4}-58 ${w}-58s${w} 18 ${w} 58Z`;
  const sides = (fill: string) => (
    <path
      d={`M${L} 204c0-22 8-36 22-45-6 12-8 28-8 45ZM${R} 204c0-22-8-36-22-45 6 12 8 28 8 45Z`}
      fill={fill}
    />
  );
  const roundCollar = (
    <>
      <path d="M78 147c4 14 12 20 22 20s18-6 22-20c-14-2-30-2-44 0Z" fill={skinDark} />
      <path d="M78 147c4 14 12 20 22 20s18-6 22-20" stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  );
  const vNeck = <path d="M80 146 100 172l20-26c-12-2-28-2-40 0Z" fill={skinDark} />;
  const buttons = (
    <>
      <path d="M100 172v32" stroke={dark} strokeWidth="3" />
      <circle cx="100" cy="182" r="2.6" fill={dark} />
      <circle cx="100" cy="194" r="2.6" fill={dark} />
    </>
  );

  switch (type) {
    case "regata":
      return (
        <>
          <path d={torso} fill={skin} />
          {sides(skinDark)}
          <path
            d={`M${100 - w * 0.62} 204 ${100 - w * 0.42} 150c8 22 ${w * 0.84 - 16} 22 ${w * 0.84} 0l${w * 0.2} 54Z`}
            fill={color}
          />
        </>
      );
    case "polo":
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
          {vNeck}
          {buttons}
          <path d="M78 145 100 172 86 180 70 152ZM122 145 100 172l14 8 16-28Z" fill={shade(color, 0.22)} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    case "social":
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
          {vNeck}
          {buttons}
          <path d="M80 144 100 170 90 184 72 154ZM120 144 100 170l10 14 18-30Z" fill={shade(color, 0.3)} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    case "blazer": {
      const jacket = "#2b2d36";
      return (
        <>
          <path d={torso} fill={jacket} />
          {sides("#1d1e25")}
          <path d="M80 146 100 204l20-58c-12-2-28-2-40 0Z" fill={color} />
          <path d="M82 146 100 170l18-24c-12-2-24-2-36 0Z" fill={skinDark} />
          <path d="M80 144 66 162l22 42h12ZM120 144l14 18-22 42h-12Z" fill="#3a3c47" stroke="#1d1e25" strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    }
    case "jaqueta":
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
          <path d="M84 147 92 204h16l8-57c-10 12-22 12-32 0Z" fill="#f2f2f2" />
          {roundCollar}
          <path d="M84 150 92 204M116 150l-8 54" stroke={dark} strokeWidth="3" strokeLinecap="round" />
          <path d="M76 146 84 150 80 170 66 158ZM124 146l-8 4 4 20 14-12Z" fill={shade(color, 0.2)} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    case "colete":
      return (
        <>
          <path d={torso} fill="#f2f2f2" />
          {sides("#cfd2da")}
          <path d={`M${100 - w * 0.62} 204 ${100 - w * 0.42} 152 100 192 ${100 + w * 0.42} 152 ${100 + w * 0.62} 204Z`} fill={color} />
          {vNeck}
          <circle cx="100" cy="198" r="2.6" fill={dark} />
        </>
      );
    case "listrada":
      return (
        <>
          <defs>
            <clipPath id={`av-t-${uid}`}>
              <path d={torso} />
            </clipPath>
          </defs>
          <path d={torso} fill={color} />
          <g clipPath={`url(#av-t-${uid})`} stroke={shade(color, 0.55)} strokeWidth="6">
            <path d="M0 172h200M0 186h200M0 200h200" />
          </g>
          {sides(dark)}
          {roundCollar}
        </>
      );
    case "uniforme":
      return (
        <>
          <path d={torso} fill="#2b2d36" />
          {sides("#1d1e25")}
          {vNeck}
          <path d="M100 172v32" stroke="#1d1e25" strokeWidth="3" />
          <path d="M78 145 100 172 86 180 70 152ZM122 145 100 172l14 8 16-28Z" fill={color} stroke="#1d1e25" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="128" cy="184" r="6" fill={color} />
          <circle cx="128" cy="184" r="2.2" fill="#fff" />
        </>
      );
    case "golaalta":
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
        </>
      );
    case "moletom":
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
          {roundCollar}
          <path d="M90 168v22M110 168v22" stroke={shade(color, 0.4)} strokeWidth="4" strokeLinecap="round" />
          <circle cx="90" cy="192" r="3" fill={shade(color, 0.4)} />
          <circle cx="110" cy="192" r="3" fill={shade(color, 0.4)} />
        </>
      );
    default:
      return (
        <>
          <path d={torso} fill={color} />
          {sides(dark)}
          {roundCollar}
        </>
      );
  }
};

export type AvatarMood = "neutro" | "feliz" | "surpreso" | "triste" | "piscadela";

/** boca e sobrancelhas de cada expressão */
const Expression = ({ mood, brow, skinDark }: { mood: AvatarMood; brow: string; skinDark: string }) => {
  const brows = {
    neutro: "M66 73c8-6 18-6 25-1M134 73c-8-6-18-6-25-1",
    feliz: "M66 69c8-7 18-7 25-2M134 69c-8-7-18-7-25-2",
    surpreso: "M66 65c8-6 18-6 25-2M134 65c-8-6-18-6-25-2",
    triste: "M66 70c8 0 18 2 25 7M134 70c-8 0-18 2-25 7",
    piscadela: "M66 73c8-6 18-6 25-1M134 70c-8-6-18-6-25-2",
  }[mood];
  return (
    <>
      <path d={brows} stroke={brow} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M96 105c2 5 6 5 8 0" stroke={skinDark} strokeWidth="4" strokeLinecap="round" fill="none" />
      {mood === "surpreso" ? (
        <>
          <ellipse cx="100" cy="125" rx="9" ry="11" fill="#7a2233" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="100" cy="130" rx="5" ry="4" fill="#ff7b93" />
        </>
      ) : mood === "triste" ? (
        <path d="M86 128c6-8 22-8 28 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : mood === "feliz" ? (
        <>
          <path d="M80 116c4 22 36 22 40 0Z" fill="#7a2233" />
          <path d="M84 117h32c0 4-2 6-4 7H88c-2-1-4-3-4-7Z" fill="#fff" />
          <path d="M90 130c6 5 14 5 20 0-4 6-16 6-20 0Z" fill="#ff7b93" />
          <path d="M80 116c4 22 36 22 40 0Z" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M84 119c6 12 26 12 32 0Z" fill="#7a2233" />
          <path d="M90 126c6 4 14 4 20 0-4 5-16 5-20 0Z" fill="#ff7b93" />
          <path d="M84 119c6 12 26 12 32 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      )}
    </>
  );
};

const Eye = ({ cx, iris, closed }: { cx: number; iris: string; closed?: boolean }) =>
  closed ? (
    <path d={`M${cx - 11} 94c6-7 16-7 22 0`} stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
  ) : (
    <g className="vd-eye">
      <ellipse cx={cx} cy="92" rx="12.5" ry="14.5" fill="#fff" />
      <g className="vd-pupil">
        <circle cx={cx + 2} cy="94" r="7.5" fill={iris} />
        <circle cx={cx + 2} cy="94" r="4" fill={INK} />
        <circle cx={cx + 4.5} cy="91" r="2.4" fill="#fff" />
      </g>
    </g>
  );

/**
 * Avatar do vendedor: desenho original do Vendê, em camadas.
 * Com `animated`, ele respira, balança a cabeça, pisca e acompanha o ponteiro
 * com os olhos; com `interactive`, dá tchau quando tocado.
 */
export const Avatar = ({
  config,
  className = "h-12 w-12",
  label = "Seu avatar",
  round = true,
  animated = false,
  interactive = false,
  mood,
  waveOnMount = false,
}: {
  config: AvatarConfig;
  className?: string;
  label?: string;
  /** recorta em círculo (padrão); false mostra o quadro inteiro */
  round?: boolean;
  animated?: boolean;
  interactive?: boolean;
  /** expressão; sem ela vale a escolhida pelo vendedor */
  mood?: AvatarMood;
  waveOnMount?: boolean;
}) => {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [waving, setWaving] = useState(waveOnMount);
  const clip = `av-clip-${uid}`;
  const { equipped } = config;
  const hat = equipped.chapeu;
  const skin = config.skin;
  const skinDark = shade(skin, -0.16);
  const skinLight = shade(skin, 0.14);
  const hair = config.hairColor;
  const shirt = config.shirt;
  const shirtDark = shade(shirt, -0.2);
  const bodyType = config.body ?? "medio";
  const body = bodies[bodyType];
  const outfit = config.outfit ?? "camiseta";
  const iris = config.eyes ?? "#5a3a22";
  const shape = config.face ?? "oval";
  const hw = body.hw + (shape === "redondo" ? 4 : shape === "fino" ? -5 : shape === "quadrado" ? 1 : 0);
  const headRx =
    shape === "quadrado" ? 26 : shape === "redondo" ? hw - 1 : Math.min(47, hw - 3);
  const headH =
    (bodyType === "gordo" ? 112 : 108) + (shape === "fino" ? 5 : shape === "redondo" ? -3 : 0);
  const face: AvatarMood = waving ? "feliz" : (mood ?? config.mood ?? "neutro");
  const sleeve = outfit === "regata" ? skin : outfit === "blazer" ? "#2b2d36" : shirt;
  // cabelo, barba, chapéu e headset acompanham a largura da cabeça
  const fit = `translate(100 0) scale(${hw / 50} 1) translate(-100 0)`;

  // os olhos acompanham o ponteiro
  useEffect(() => {
    if (!animated) return;
    const svg = ref.current;
    if (!svg) return;
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.46);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 160);
      svg.style.setProperty("--vd-px", `${((dx / d) * 3.2 * reach).toFixed(2)}px`);
      svg.style.setProperty("--vd-py", `${((dy / d) * 2.6 * reach).toFixed(2)}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animated]);

  const wave = () => interactive && setWaving(true);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      className={`shrink-0 ${className} ${animated ? "vd-anim" : ""} ${waving ? "vd-waving" : ""} ${interactive ? "cursor-pointer select-none rounded-[14%] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-farol-accent" : ""}`}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${label}: toque para um tchau` : label}
      onClick={wave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          wave();
        }
      }}
    >
      <defs>
        <clipPath id={clip}>
          {round ? <circle cx="100" cy="100" r="100" /> : <rect width="200" height="200" rx="28" />}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <Background id={equipped.fundo} gid={`av-g-${uid}`} />
        <g className="vd-head">
          <g transform={fit}>
            <HairBack style={config.hair} color={shade(hair, -0.12)} />
          </g>
        </g>

        <g className="vd-body">
          {outfit === "moletom" && (
            <path d="M62 160c-6-34 14-46 38-46s44 12 38 46Z" fill={shirtDark} />
          )}
          <Outfit type={outfit} w={body.w} color={shirt} dark={shirtDark} skin={skin} skinDark={skinDark} uid={uid} />
          {equipped.acessorio !== "headset" && <Accessory id={equipped.acessorio} />}
        </g>
        {/* pescoço */}
        <path d={`M${100 - body.neck} 118h${body.neck * 2}v28c0 12-${body.neck * 2} 12-${body.neck * 2} 0Z`} fill={skinDark} />

        {outfit === "golaalta" && (
          <>
            <rect x={100 - body.neck - 5} y="130" width={body.neck * 2 + 10} height="24" rx="9" fill={shirt} />
            <path d={`M${100 - body.neck - 3} 141h${body.neck * 2 + 6}`} stroke={shirtDark} strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        <g className="vd-head">
          <ellipse cx={100 - hw - 4} cy="98" rx="11" ry="14" fill={skin} />
          <ellipse cx={100 + hw + 4} cy="98" rx="11" ry="14" fill={skin} />
          <ellipse cx={100 - hw - 4} cy="99" rx="5" ry="7" fill={skinDark} />
          <ellipse cx={100 + hw + 4} cy="99" rx="5" ry="7" fill={skinDark} />
          <rect x={100 - hw} y="36" width={hw * 2} height={headH} rx={headRx} fill={skin} />
          {/* volume: sombra de um lado, luz do outro */}
          <path d={`M${100 + hw} 84c0 40-18 60-50 60 22-8 36-28 36-64 0-16-6-30-14-38 18 6 28 22 28 42Z`} fill={skinDark} opacity=".28" />
          <path d="M60 60c8-10 22-16 40-16" stroke={skinLight} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".7" />
          <circle cx={bodyType === "gordo" ? 64 : 68} cy="114" r={bodyType === "gordo" ? 12 : 10} fill="#ff5a7a" opacity=".22" />
          <circle cx={bodyType === "gordo" ? 136 : 132} cy="114" r={bodyType === "gordo" ? 12 : 10} fill="#ff5a7a" opacity=".22" />
          {bodyType === "gordo" && (
            <path d="M82 138c10 6 26 6 36 0" stroke={skinDark} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          )}

          {config.marks === "sardas" && (
            <g fill={skinDark}>
              <circle cx="64" cy="108" r="1.8" /><circle cx="70" cy="104" r="1.8" /><circle cx="73" cy="111" r="1.8" />
              <circle cx="136" cy="108" r="1.8" /><circle cx="130" cy="104" r="1.8" /><circle cx="127" cy="111" r="1.8" />
            </g>
          )}
          {config.marks === "pinta" && <circle cx="124" cy="122" r="2.6" fill={shade(skin, -0.5)} />}

          <g transform={fit}>
            <FacialHair style={config.beard} color={hair} />
          </g>

          <Eye cx={79} iris={iris} />
          <Eye cx={121} iris={iris} closed={face === "piscadela"} />
          <Expression mood={face} brow={shade(hair, -0.1)} skinDark={skinDark} />

          <g transform={fit}>
            {!hat && <HairFront style={config.hair} color={hair} />}
            {hat && config.hair !== "careca" && (
              <path d="M48 94c-2-12 0-22 4-30h96c4 8 6 18 4 30-2-10-6-17-12-22H60c-6 5-10 12-12 22Z" fill={hair} opacity={config.hair === "raspado" || config.hair === "moicano" ? 0.55 : 1} />
            )}
          </g>

          <Glasses id={equipped.oculos} />
          <g transform={fit}>
            <Hat id={hat} />
            {equipped.acessorio === "headset" && <Accessory id="headset" />}
          </g>
        </g>

        {/* braço do tchau: fica escondido embaixo e sobe quando o avatar é tocado */}
        {(interactive || waveOnMount) && (
          <g className="vd-arm" onAnimationEnd={() => setWaving(false)}>
            <rect x="166" y="130" width="26" height="90" rx="13" fill={sleeve} />
            <rect x="166" y="130" width="26" height="26" rx="13" fill={skin} />
            <circle cx="179" cy="118" r="17" fill={skin} />
            <rect x="163" y="94" width="8" height="22" rx="4" fill={skin} />
            <rect x="172" y="88" width="8" height="26" rx="4" fill={skin} />
            <rect x="181" y="90" width="8" height="24" rx="4" fill={skin} />
            <rect x="190" y="96" width="7" height="20" rx="3.5" fill={skin} />
            <ellipse cx="163" cy="122" rx="6" ry="9" fill={skin} transform="rotate(-35 163 122)" />
            <path d="M170 124c5 5 13 5 18 0" stroke={skinDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}
      </g>
    </svg>
  );
};
