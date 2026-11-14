import { useId } from "react";
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
      return cap;
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
}: {
  type: string;
  w: number;
  color: string;
  dark: string;
  skin: string;
  skinDark: string;
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

/** Avatar do vendedor: desenho original do Vendê, em camadas, montado a partir da configuração */
export const Avatar = ({
  config,
  className = "h-12 w-12",
  label = "Seu avatar",
  round = true,
}: {
  config: AvatarConfig;
  className?: string;
  label?: string;
  /** recorta em círculo (padrão); false mostra o quadro inteiro */
  round?: boolean;
}) => {
  const uid = useId().replace(/:/g, "");
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
  const hw = body.hw;
  // cabelo, barba, chapéu e headset acompanham a largura da cabeça
  const fit = `translate(100 0) scale(${hw / 50} 1) translate(-100 0)`;

  return (
    <svg viewBox="0 0 200 200" className={`shrink-0 ${className}`} role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          {round ? <circle cx="100" cy="100" r="100" /> : <rect width="200" height="200" rx="28" />}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <Background id={equipped.fundo} gid={`av-g-${uid}`} />
        <g transform={fit}>
          <HairBack style={config.hair} color={shade(hair, -0.12)} />
        </g>
        {outfit === "moletom" && (
          <path d="M62 160c-6-34 14-46 38-46s44 12 38 46Z" fill={shirtDark} />
        )}

        <Outfit type={outfit} w={body.w} color={shirt} dark={shirtDark} skin={skin} skinDark={skinDark} />
        {/* pescoço */}
        <path d={`M${100 - body.neck} 120h${body.neck * 2}v26c0 12-${body.neck * 2} 12-${body.neck * 2} 0Z`} fill={skinDark} />

        {/* cabeça */}
        <ellipse cx={100 - hw - 4} cy="98" rx="11" ry="14" fill={skin} />
        <ellipse cx={100 + hw + 4} cy="98" rx="11" ry="14" fill={skin} />
        <ellipse cx={100 - hw - 4} cy="99" rx="5" ry="7" fill={skinDark} />
        <ellipse cx={100 + hw + 4} cy="99" rx="5" ry="7" fill={skinDark} />
        <rect x={100 - hw} y="36" width={hw * 2} height={bodyType === "gordo" ? 112 : 108} rx={Math.min(47, hw - 3)} fill={skin} />
        <path d="M60 60c8-10 22-16 40-16" stroke={skinLight} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".7" />
        <circle cx={bodyType === "gordo" ? 64 : 68} cy="114" r={bodyType === "gordo" ? 12 : 10} fill="#ff5a7a" opacity=".22" />
        <circle cx={bodyType === "gordo" ? 136 : 132} cy="114" r={bodyType === "gordo" ? 12 : 10} fill="#ff5a7a" opacity=".22" />
        {bodyType === "gordo" && (
          <path d="M82 138c10 6 26 6 36 0" stroke={skinDark} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}

        <g transform={fit}>
          <FacialHair style={config.beard} color={hair} />
        </g>

        {/* olhos */}
        <ellipse cx="79" cy="92" rx="12.5" ry="14.5" fill="#fff" />
        <ellipse cx="121" cy="92" rx="12.5" ry="14.5" fill="#fff" />
        <circle cx="81" cy="94" r="7.5" fill={iris} />
        <circle cx="123" cy="94" r="7.5" fill={iris} />
        <circle cx="81" cy="94" r="4" fill={INK} />
        <circle cx="123" cy="94" r="4" fill={INK} />
        <circle cx="83.5" cy="91" r="2.4" fill="#fff" />
        <circle cx="125.5" cy="91" r="2.4" fill="#fff" />
        {/* sobrancelhas */}
        <path d="M66 73c8-6 18-6 25-1M134 73c-8-6-18-6-25-1" stroke={shade(hair, -0.1)} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* nariz e boca */}
        <path d="M96 105c2 5 6 5 8 0" stroke={skinDark} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M84 119c6 12 26 12 32 0Z" fill="#7a2233" />
        <path d="M90 126c6 4 14 4 20 0-4 5-16 5-20 0Z" fill="#ff7b93" />
        <path d="M84 119c6 12 26 12 32 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />

        <g transform={fit}>
          {!hat && <HairFront style={config.hair} color={hair} />}
          {hat && config.hair !== "careca" && (
            <path d="M48 94c-2-12 0-22 4-30h96c4 8 6 18 4 30-2-10-6-17-12-22H60c-6 5-10 12-12 22Z" fill={hair} opacity={config.hair === "raspado" || config.hair === "moicano" ? 0.55 : 1} />
          )}
        </g>

        <Glasses id={equipped.oculos} />
        <g transform={fit}>
          <Hat id={hat} />
        </g>
        {equipped.acessorio === "headset" ? (
          <g transform={fit}>
            <Accessory id="headset" />
          </g>
        ) : (
          <Accessory id={equipped.acessorio} />
        )}
      </g>
    </svg>
  );
};
