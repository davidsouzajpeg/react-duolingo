import { useEffect, useMemo, useState } from "react";

const colors = ["#ff0084", "#f5b331", "#3fcf86", "#4f8cff", "#ffffff", "#ff66b5"];

/**
 * Confete do Vendê.
 * - "burst": estouro curto a partir de um ponto (acerto de questão);
 *   coloque dentro de um pai `relative`.
 * - "rain": chuva pela tela inteira (fim de lição, parabéns).
 */
export const Confetti = ({
  kind = "burst",
  count,
}: {
  kind?: "burst" | "rain";
  count?: number;
}) => {
  const pieces = useMemo(() => {
    const n = count ?? (kind === "burst" ? 28 : 80);
    return Array.from({ length: n }, (_, i) => {
      const angle = Math.PI * (1.05 + Math.random() * 0.9); // leque para cima
      const dist = 70 + Math.random() * 130;
      return {
        id: i,
        color: colors[i % colors.length]!,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: Math.round(Math.random() * 720 - 360),
        size: 6 + Math.random() * 7,
        round: Math.random() < 0.3,
        left: Math.random() * 100,
        delay: Math.random() * (kind === "burst" ? 0.08 : 1.4),
        dur: 2.4 + Math.random() * 1.8,
        sway: Math.round(Math.random() * 120 - 60),
      };
    });
  }, [kind, count]);

  if (kind === "rain") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="vd-rain absolute block"
            style={{
              left: `${p.left}%`,
              top: "-24px",
              width: p.size,
              height: p.size * (p.round ? 1 : 1.6),
              borderRadius: p.round ? "50%" : 2,
              backgroundImage: `linear-gradient(135deg, #ffffffaa, ${p.color} 45%, ${p.color}cc)`,
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}66`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              ["--vd-r" as string]: `${p.rot}deg`,
              ["--vd-sway" as string]: `${p.sway}px`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-20 h-0 w-0">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="vd-burst absolute block"
          style={{
            width: p.size,
            height: p.size * (p.round ? 1 : 1.5),
            borderRadius: p.round ? "50%" : 2,
            backgroundImage: `linear-gradient(135deg, #ffffffaa, ${p.color} 45%, ${p.color}cc)`,
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}66`,
            animationDelay: `${p.delay}s`,
            ["--vd-dx" as string]: `${p.dx.toFixed(0)}px`,
            ["--vd-dy" as string]: `${p.dy.toFixed(0)}px`,
            ["--vd-r" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
};

/** Número que sobe de zero até o valor (placar do fim da lição) */
export const CountUp = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1000,
  delay = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
}) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return (
    <>
      {prefix}
      {shown}
      {suffix}
    </>
  );
};
