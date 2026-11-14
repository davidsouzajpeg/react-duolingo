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

export const FlameIcon = ({ off, ...props }: IconProps & { off?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M12 2.5c.6 3-1.2 4.6-2.7 6.2C7.8 10.3 6.5 12 6.5 14.6 6.5 18 9 21 12 21s5.5-3 5.5-6.4c0-2.3-1-3.8-2-5-.3 1.3-1 2.2-2 2.6.5-3.6-.3-7-1.5-8.7Z"
      fill={off ? "#4a4c56" : "#f5b331"}
    />
    <path
      d="M12 21c-1.8 0-3-1.5-3-3.3 0-1.9 1.4-2.8 2.2-4.1.4 1 1.1 1.5 1.8 1.6-.2-.9 0-1.8.5-2.4.9 1.1 1.5 2.4 1.5 4 0 2.4-1.2 4.2-3 4.2Z"
      fill={off ? "#383a43" : "#ffe6a8"}
    />
  </svg>
);

export const CoinIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <circle cx="12" cy="12" r="9.5" fill="#b9841c" />
    <circle cx="12" cy="12" r="7.6" fill="#f5b331" />
    <path d="M12 7.5v9M14.3 9.4c-.4-.6-1.2-1-2.3-1-1.4 0-2.3.7-2.3 1.7 0 2.4 4.8 1.2 4.8 3.7 0 1-1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1.1" stroke="#7a560f" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const XpIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="m13.5 2-9 12h7l-1 8 9-12h-7l1-8Z" fill="#ff0084" stroke="#c4006a" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

export const ShieldIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6l-8-3Z" fill="#3fcf86" />
    <path d="m8.5 12 2.5 2.5 4.5-5" stroke="#121317" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

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
