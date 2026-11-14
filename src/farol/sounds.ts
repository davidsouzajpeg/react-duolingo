/**
 * Sons do Vendê, sintetizados na hora com Web Audio (sem arquivos de áudio).
 * Timbre de sino com um eco curto: acerto, erro, compra e as fanfarras de
 * fim de lição.
 */

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let echo: DelayNode | null = null;

const engine = () => {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      const compressor = ctx.createDynamicsCompressor();
      compressor.connect(ctx.destination);
      out = ctx.createGain();
      out.gain.value = 0.9;
      out.connect(compressor);
      // eco curto, para o som não ficar seco
      echo = ctx.createDelay(0.5);
      echo.delayTime.value = 0.17;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      echo.connect(feedback).connect(echo);
      echo.connect(wet).connect(compressor);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx && out && echo ? { ctx, out, echo } : null;
  } catch {
    return null;
  }
};

const note = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);
// atalhos (semitons a partir do Lá 4)
const C5 = 3, E5 = 7, G5 = 10, C6 = 15, E6 = 19, G6 = 22, C7 = 27;

/** sino: fundamental + parciais, ataque rápido e cauda longa */
const bell = (freq: number, at: number, dur = 0.9, vol = 0.16) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const partials: [number, number][] = [
    [1, 1],
    [2, 0.42],
    [3, 0.2],
    [4.2, 0.09],
  ];
  for (const [ratio, level] of partials) {
    const osc = e.ctx.createOscillator();
    const gain = e.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const d = dur / Math.sqrt(ratio);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol * level, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(gain);
    gain.connect(e.out);
    gain.connect(e.echo);
    osc.start(t);
    osc.stop(t + d + 0.05);
  }
};

/** nota grave e macia (base das fanfarras e som de erro) */
const soft = (freq: number, at: number, dur = 0.35, vol = 0.16, glideTo?: number) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const osc = e.ctx.createOscillator();
  const filter = e.ctx.createBiquadFilter();
  const gain = e.ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  filter.type = "lowpass";
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(filter).connect(gain).connect(e.out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
};

/** brilho: ruído filtrado subindo, como confete caindo */
const shimmer = (at: number, dur = 0.9, vol = 0.05) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const buffer = e.ctx.createBuffer(1, Math.ceil(e.ctx.sampleRate * dur), e.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = e.ctx.createBufferSource();
  src.buffer = buffer;
  const filter = e.ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(1800, t);
  filter.frequency.exponentialRampToValueAtTime(9000, t + dur);
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(e.out);
  src.start(t);
};

const sparkles = (at: number, count: number, span: number) => {
  const scale = [C6, E6, G6, C7, 29, 31]; // pentatônica aguda
  for (let i = 0; i < count; i++) {
    const n = scale[Math.floor(Math.random() * scale.length)]!;
    bell(note(n), at + (span * i) / count + Math.random() * 0.04, 0.35, 0.05);
  }
};

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12];

export const sfx = {
  /** acerto: "tim-tim" que sobe de tom a cada acerto seguido */
  correct: (combo = 1) => {
    const step = majorScale[Math.min(combo - 1, majorScale.length - 1)] ?? 0;
    bell(note(E5 + step), 0, 0.5, 0.17);
    bell(note(E5 + step + 7), 0.09, 0.8, 0.17);
    if (combo >= 3) sparkles(0.16, 3, 0.25);
  },

  /** erro: duas notas graves e macias, sem susto */
  wrong: () => {
    soft(311, 0, 0.2, 0.15);
    soft(233, 0.14, 0.38, 0.15, 196);
  },

  /** compra ou recompensa: moedinha */
  coin: () => {
    bell(note(14), 0, 0.25, 0.13);
    bell(note(E6), 0.07, 0.6, 0.13);
  },

  /** tchau do avatar e pequenos destaques */
  pop: () => {
    bell(note(G5), 0, 0.25, 0.1);
    bell(note(C6), 0.06, 0.35, 0.1);
  },

  /** fim de lição: fanfarra de acordo com o farol */
  finish: (sinal: "verde" | "amarelo" | "vermelho") => {
    if (sinal === "vermelho") {
      // incentivo curto: sobe, não pune
      bell(note(-2), 0, 0.5, 0.14);
      bell(note(C5), 0.16, 0.9, 0.14);
      return;
    }
    // arpejo de entrada
    [C5, E5, G5, C6].forEach((n, i) => bell(note(n), i * 0.085, 0.5, 0.15));
    soft(note(-21), 0, 0.5, 0.2);
    // acorde aberto
    const chordAt = 0.4;
    [C6, E6, G6].forEach((n) => bell(note(n), chordAt, 1.6, 0.12));
    soft(note(-21), chordAt, 0.9, 0.22);
    soft(note(-14), chordAt, 0.9, 0.14);
    shimmer(chordAt, 1.1, 0.045);
    if (sinal === "verde") {
      // "ta-da-dá" final + brilhos
      [E6, G6, C7].forEach((n, i) => bell(note(n), 0.78 + i * 0.11, i === 2 ? 1.8 : 0.5, 0.14));
      soft(note(-21), 1.0, 1.2, 0.22);
      sparkles(1.05, 9, 1.1);
      shimmer(1.0, 1.5, 0.05);
    } else {
      sparkles(0.6, 4, 0.6);
    }
  },

  /** subir de nível ou de divisão */
  levelUp: () => {
    [G5, C6, E6, G6].forEach((n, i) => bell(note(n), i * 0.1, 0.6, 0.14));
    [C6, E6, G6, C7].forEach((n) => bell(note(n), 0.46, 1.8, 0.11));
    soft(note(-21), 0.46, 1.2, 0.22);
    sparkles(0.6, 8, 1);
    shimmer(0.46, 1.4, 0.05);
  },
};
