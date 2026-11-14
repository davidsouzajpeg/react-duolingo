/**
 * Sons do Vendê, sintetizados na hora com Web Audio (sem arquivos de áudio).
 *
 * A linguagem é a de jogo, não a de notificação: ondas quadradas e dente de
 * serra com ataque seco, arpejos rápidos, bumbo, caixa e prato. Cada evento
 * tem a sua assinatura (acerto, erro, moeda, combo, fim de lição, subida de
 * nível, presente).
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
const G4 = -2, C5 = 3, D5 = 5, E5 = 7, G5 = 10, A5 = 12, B5 = 14, C6 = 15, D6 = 17, E6 = 19, G6 = 22, C7 = 27;

type ToneOptions = {
  type?: OscillatorType;
  vol?: number;
  /** desliza a frequência até este valor */
  slideTo?: number;
  /** corte do filtro passa-baixa (Hz) */
  cutoff?: number;
  echo?: boolean;
};

/** nota de sintetizador com ataque seco (a base dos sons de jogo) */
const tone = (freq: number, at: number, dur: number, o: ToneOptions = {}) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const osc = e.ctx.createOscillator();
  const gain = e.ctx.createGain();
  osc.type = o.type ?? "square";
  osc.frequency.setValueAtTime(freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
  const vol = o.vol ?? 0.09;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  gain.gain.setValueAtTime(vol, t + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let last: AudioNode = osc;
  if (o.cutoff) {
    const filter = e.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = o.cutoff;
    osc.connect(filter);
    last = filter;
  }
  last.connect(gain);
  gain.connect(e.out);
  if (o.echo) gain.connect(e.echo);
  osc.start(t);
  osc.stop(t + dur + 0.03);
};

/** ruído filtrado: caixa, prato, chocalho e "whoosh" */
const noise = (
  at: number,
  dur: number,
  o: { vol?: number; from?: number; to?: number; q?: number; type?: BiquadFilterType } = {},
) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const buffer = e.ctx.createBuffer(1, Math.ceil(e.ctx.sampleRate * dur), e.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = e.ctx.createBufferSource();
  src.buffer = buffer;
  const filter = e.ctx.createBiquadFilter();
  filter.type = o.type ?? "bandpass";
  filter.Q.value = o.q ?? 1;
  filter.frequency.setValueAtTime(o.from ?? 3000, t);
  if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(o.vol ?? 0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(e.out);
  src.start(t);
};

/** bumbo: senoide que despenca de tom */
const kick = (at: number, vol = 0.32) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const osc = e.ctx.createOscillator();
  const gain = e.ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(170, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.13);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(gain).connect(e.out);
  osc.start(t);
  osc.stop(t + 0.22);
};

const snare = (at: number, vol = 0.14) => {
  noise(at, 0.12, { vol, from: 1900, q: 0.7 });
  tone(190, at, 0.07, { type: "triangle", vol: vol * 0.6 });
};

const cymbal = (at: number, dur = 0.9, vol = 0.07) =>
  noise(at, dur, { vol, from: 7500, q: 0.4, type: "highpass" });

/** metal de fanfarra: dente de serra + quadrada, com filtro */
const brass = (semitone: number, at: number, dur: number, vol = 0.085) => {
  tone(note(semitone), at, dur, { type: "sawtooth", vol, cutoff: 2600, echo: true });
  tone(note(semitone), at, dur, { type: "square", vol: vol * 0.45, cutoff: 3200 });
};

/** arpejo rápido de onda quadrada */
const run = (notes: number[], at: number, step: number, vol = 0.07, len = step * 1.6) =>
  notes.forEach((n, i) => tone(note(n), at + i * step, len, { vol, echo: true }));

const majorScale = [0, 2, 4, 5, 7, 9, 11, 12];

export const sfx = {
  /** toque em opção ou botão: clique seco */
  tap: () => {
    tone(1100, 0, 0.035, { vol: 0.045 });
    noise(0, 0.02, { vol: 0.03, from: 5000 });
  },

  /** acerto: três notas subindo, com estalo; sobe de tom a cada acerto seguido */
  correct: (combo = 1) => {
    const up = majorScale[Math.min(combo - 1, majorScale.length - 1)] ?? 0;
    run([E5 + up, B5 + up, E6 + up], 0, 0.065, 0.08, 0.16);
    tone(note(E5 + up - 12), 0, 0.14, { type: "triangle", vol: 0.14 });
    noise(0, 0.04, { vol: 0.05, from: 6000 });
    if (combo >= 3) {
      // combo: mais uma subida brilhante por cima
      run([E6 + up, G6 + up, C7 + up - 1], 0.2, 0.05, 0.05, 0.12);
      cymbal(0.2, 0.3, 0.035);
    }
  },

  /** erro: "bonk" grave, que não assusta */
  wrong: () => {
    tone(196, 0, 0.16, { type: "sawtooth", vol: 0.12, slideTo: 140, cutoff: 900 });
    tone(147, 0.13, 0.26, { type: "sawtooth", vol: 0.12, slideTo: 98, cutoff: 700 });
    noise(0, 0.07, { vol: 0.06, from: 300, q: 0.6, type: "lowpass" });
  },

  /** moeda: o clássico "plim" de duas notas */
  coin: () => {
    tone(note(B5), 0, 0.07, { vol: 0.09 });
    tone(note(E6), 0.07, 0.32, { vol: 0.09, echo: true });
  },

  /** balão de conversa e pequenos destaques */
  pop: () => {
    tone(320, 0, 0.09, { type: "sine", vol: 0.16, slideTo: 760 });
  },

  /** entrada em uma lição ou tela */
  whoosh: () => {
    noise(0, 0.32, { vol: 0.09, from: 350, to: 4200, q: 1.4 });
    tone(220, 0, 0.3, { type: "triangle", vol: 0.05, slideTo: 880 });
  },

  /** algo foi liberado */
  unlock: () => {
    tone(note(C5), 0, 0.08, { type: "triangle", vol: 0.14 });
    tone(note(G5), 0.08, 0.2, { type: "triangle", vol: 0.14, echo: true });
    noise(0, 0.03, { vol: 0.05, from: 4000 });
  },

  /** fim de lição: fanfarra de acordo com o farol */
  finish: (sinal: "verde" | "amarelo" | "vermelho") => {
    if (sinal === "vermelho") {
      // incentivo curto: sobe, não pune
      tone(note(G4), 0, 0.22, { type: "triangle", vol: 0.14 });
      tone(note(C5), 0.2, 0.5, { type: "triangle", vol: 0.14, echo: true });
      return;
    }
    // virada de bateria e entrada
    snare(0);
    snare(0.09);
    snare(0.18, 0.18);
    kick(0.27);
    cymbal(0.27, 0.9);
    brass(C5, 0.27, 0.13);
    brass(E5, 0.4, 0.13);
    brass(G5, 0.53, 0.13);
    if (sinal === "amarelo") {
      kick(0.66);
      [C5, E5, G5, C6].forEach((n) => brass(n, 0.66, 0.7, 0.06));
      return;
    }
    // verde: frase completa, acorde final e brilhos
    brass(C6, 0.66, 0.26);
    kick(0.66);
    brass(G5, 0.94, 0.11);
    brass(C6, 1.06, 0.11);
    kick(1.2, 0.36);
    cymbal(1.2, 1.5, 0.09);
    [C5, E5, G5, C6, E6].forEach((n) => brass(n, 1.2, 1.1, 0.055));
    run([C6, E6, G6, C7, G6, C7], 1.3, 0.07, 0.05, 0.14);
    run([E6, G6, C7], 1.8, 0.09, 0.04, 0.3);
  },

  /** subir de nível ou de divisão: escala disparada e acorde */
  levelUp: () => {
    run([C5, D5, E5, G5, A5, C6, D6, E6, G6], 0, 0.045, 0.07, 0.09);
    kick(0.42, 0.34);
    cymbal(0.42, 1.2, 0.08);
    [C5, G5, C6, E6, G6].forEach((n) => brass(n, 0.42, 0.9, 0.055));
    run([G6, C7, G6, C7], 0.6, 0.08, 0.045, 0.2);
  },

  /** presente: a caixa chacoalhando antes de abrir */
  giftShake: () => {
    for (let i = 0; i < 6; i++) {
      noise(i * 0.16, 0.07, { vol: 0.07, from: 2400 + (i % 2) * 900, q: 2 });
      tone(180 + i * 25, i * 0.16, 0.05, { type: "triangle", vol: 0.07 });
    }
    // tensão subindo até a abertura
    tone(160, 0.1, 0.95, { type: "sawtooth", vol: 0.05, slideTo: 900, cutoff: 1800 });
    noise(0.3, 0.75, { vol: 0.05, from: 500, to: 6000, q: 1.2 });
  },

  /** presente: a tampa voa e o prêmio aparece */
  giftOpen: () => {
    kick(0, 0.36);
    cymbal(0, 1.4, 0.1);
    noise(0, 0.25, { vol: 0.1, from: 900, to: 5000, q: 0.8 });
    [C5, E5, G5, C6].forEach((n) => brass(n, 0, 0.5, 0.06));
    run([G5, C6, E6, G6, C7], 0.08, 0.06, 0.06, 0.14);
    brass(C6, 0.5, 0.12);
    brass(E6, 0.62, 0.12);
    [C6, E6, G6].forEach((n) => brass(n, 0.76, 1.0, 0.06));
    kick(0.76, 0.3);
    run([C7, G6, C7, E6, C7], 0.9, 0.08, 0.04, 0.22);
  },
};
