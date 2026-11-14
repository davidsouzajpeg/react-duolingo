import { useId } from "react";
import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

export const HeartIcon = ({ empty, ...props }: IconProps & { empty?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21Z"
      fill={empty ? "#383a43" : "#ff5a4f"}
    />
    {!empty && (
      <path d="M7 8.2c.7-.8 1.8-1 2.6-.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" fill="none" />
    )}
  </svg>
);

export const FlameIcon = ({ off, ...props }: IconProps & { off?: boolean }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <linearGradient id={`fl-a-${id}`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={off ? "#5a5c68" : "#ffd24a"} />
          <stop offset="0.55" stopColor={off ? "#4a4c56" : "#ff8a1f"} />
          <stop offset="1" stopColor={off ? "#383a43" : "#ff3d54"} />
        </linearGradient>
        <radialGradient id={`fl-b-${id}`} cx="0.5" cy="0.75" r="0.6">
          <stop offset="0" stopColor={off ? "#4a4c56" : "#fffbe0"} />
          <stop offset="1" stopColor={off ? "#383a43" : "#ffd24a"} />
        </radialGradient>
      </defs>
      <path
        d="M12 2.5c.6 3-1.2 4.6-2.7 6.2C7.8 10.3 6.5 12 6.5 14.6 6.5 18 9 21 12 21s5.5-3 5.5-6.4c0-2.3-1-3.8-2-5-.3 1.3-1 2.2-2 2.6.5-3.6-.3-7-1.5-8.7Z"
        fill={`url(#fl-a-${id})`}
      />
      <path
        d="M12 21c-1.8 0-3-1.5-3-3.3 0-1.9 1.4-2.8 2.2-4.1.4 1 1.1 1.5 1.8 1.6-.2-.9 0-1.8.5-2.4.9 1.1 1.5 2.4 1.5 4 0 2.4-1.2 4.2-3 4.2Z"
        fill={`url(#fl-b-${id})`}
      />
    </svg>
  );
};

/** Moeda com volume: aro, face em degradê, relevo interno e brilho */
export const CoinIcon = (props: IconProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <linearGradient id={`co-rim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset="0.5" stopColor="#e2a52a" />
          <stop offset="1" stopColor="#8a5a0c" />
        </linearGradient>
        <radialGradient id={`co-face-${id}`} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fff3c2" />
          <stop offset="0.45" stopColor="#ffc93c" />
          <stop offset="1" stopColor="#d68a12" />
        </radialGradient>
        <linearGradient id={`co-in-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a6410" />
          <stop offset="1" stopColor="#ffe08a" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="13.2" rx="9.6" ry="9.3" fill="#6b4409" opacity=".55" />
      <circle cx="12" cy="12" r="9.6" fill={`url(#co-rim-${id})`} />
      <circle cx="12" cy="12" r="7.7" fill={`url(#co-face-${id})`} />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke={`url(#co-in-${id})`} strokeWidth="0.9" opacity=".8" />
      <path d="M12 7.6v8.8M14.3 9.5c-.4-.6-1.2-1-2.3-1-1.4 0-2.3.7-2.3 1.7 0 2.4 4.8 1.2 4.8 3.7 0 1-1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1.1" stroke="#8a5a0c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M12 7.2v8.8M14.3 9.1c-.4-.6-1.2-1-2.3-1-1.4 0-2.3.7-2.3 1.7 0 2.4 4.8 1.2 4.8 3.7 0 1-1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1.1" stroke="#fff6d6" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M5.6 9.2C6.8 6.4 9.4 4.7 12.4 4.7" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".75" />
      <circle cx="16.6" cy="16.4" r="0.9" fill="#fff" opacity=".35" />
    </svg>
  );
};

/** Faísca: raio em degradê, com brilho na borda de cima */
export const XpIcon = (props: IconProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <linearGradient id={`xp-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ff8fc9" />
          <stop offset="0.45" stopColor="#ff0084" />
          <stop offset="1" stopColor="#8f1fd6" />
        </linearGradient>
      </defs>
      <path d="m13.5 2.6-9 12h7l-1 8 9-12h-7l1-8Z" fill="#5a0a44" opacity=".5" />
      <path d="m13.5 2-9 12h7l-1 8 9-12h-7l1-8Z" fill={`url(#xp-${id})`} />
      <path d="M12.6 4.6 6.6 12.7" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity=".6" />
    </svg>
  );
};

export const ShieldIcon = (props: IconProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <linearGradient id={`sh-${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#8ff0bd" />
          <stop offset="0.5" stopColor="#3fcf86" />
          <stop offset="1" stopColor="#12805c" />
        </linearGradient>
      </defs>
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6l-8-3Z" fill={`url(#sh-${id})`} />
      <path d="M12 4.6 6 6.9v4.6c0 1 .2 2 .5 2.9" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="m8.5 12 2.5 2.5 4.5-5" stroke="#0c3b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

export const LockIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
    <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3L2.9 9.4l6.3-.8L12 2.8Z" fill="currentColor" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const MapIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" fill="currentColor" opacity=".25" />
    <path d="M9 4 3.5 6v14L9 18m0-14 6 2M9 4v14m6-12 5.5-2v14L15 20m0-14v14m0 0-6-2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const PodiumIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="M9 8h6v12H9zM3 13h6v7H3zM15 11h6v9h-6z" fill="currentColor" opacity=".25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="m12 2 .9 1.8 2 .3-1.5 1.4.4 2L12 6.6 10.2 7.5l.4-2-1.5-1.4 2-.3L12 2Z" fill="currentColor" />
  </svg>
);

export const MedalIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="M8 2h3l2 6H10L8 2Zm8 0h-3l-2 6h3l2-6Z" fill="currentColor" opacity=".35" />
    <circle cx="12" cy="15" r="6.5" fill="currentColor" opacity=".25" stroke="currentColor" strokeWidth="2" />
    <path d="m12 11.8 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" fill="currentColor" />
  </svg>
);
