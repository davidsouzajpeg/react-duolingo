import type { ComponentProps } from "react";

export const ProgressBar = ({
  value,
  color,
  className = "h-3",
}: {
  value: number;
  color: string;
  className?: string;
}) => (
  <div
    className={`w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(Math.min(1, value) * 100)}
  >
    <div
      className="relative h-full rounded-full transition-all duration-500"
      style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        backgroundColor: color,
      }}
    >
      <div className="absolute left-2 right-2 top-[20%] h-[25%] rounded-full bg-white/30" />
    </div>
  </div>
);

type ButtonVariant = "primary" | "success" | "danger" | "ghost" | "navy";

const variants: Record<ButtonVariant, string> = {
  primary: "border-[#c7811a] bg-[#f5a524] text-white",
  success: "border-green-700 bg-green-500 text-white",
  danger: "border-rose-700 bg-rose-500 text-white",
  navy: "border-[#06162a] bg-[#0f2742] text-white",
  ghost: "border-gray-300 border-2 bg-white text-gray-500 hover:bg-gray-50",
};

export const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) => (
  <button
    className={`rounded-2xl border-b-4 px-6 py-3 font-extrabold uppercase tracking-wide transition hover:brightness-105 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:active:translate-y-0 disabled:active:border-b-4 ${variants[variant]} ${className}`}
    {...props}
  />
);
