/**
 * Sons do Vendê, sintetizados na hora com Web Audio (sem arquivos de áudio).
 *
 * Caráter: sóbrio e caloroso. Timbre de marimba e de teclas macias (ondas
 * senoidais e triangulares), registro médio-grave, acordes suaves de fundo e
 * uma reverberação curta. Nada de ondas quadradas, pratos ou notas muito
 * agudas: tudo passa por um filtro que corta o brilho excessivo.
 */

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let room: GainNode | null = null;

const engine = () => {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.connect(ctx.destination);

      // filtro geral: tira o brilho que deixa o som estridente
      const tame = ctx.createBiquadFilter();
      tame.type = "lowpass";
      tame.frequency.value = 3400;
      tame.Q.value = 0.4;
      tame.connect(compressor);

      out = ctx.createGain();
      out.gain.value = 0.85;
      out.connect(tame);

      // reverberação curta, gerada por ruído que decai (sala pequena)
      const seconds = 1.4;
      const impulse = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3.2);
        }
      }
      const reverb = ctx.createConvolver();
      reverb.buffer = impulse;
      const wet = ctx.createGain();
      wet.gain.value = 0.22;
      room = ctx.createGain();
      room.connect(reverb).connect(wet).connect(tame);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx && out && room ? { ctx, out, room } : null;
  } catch {
    return null;
  }
};

const note = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);
// atalhos (semitons a partir do Lá 4): registro médio, sem notas muito agudas
const A3 = -12, C4 = -9, E4 = -5, G4 = -2, A4 = 0, C5 = 3, D5 = 5, E5 = 7, G5 = 10;

/** tecla de marimba: ataque macio, corpo curto e um harmônico que some rápido */
const mallet = (semitone: number, at: number, dur = 0.5, vol = 0.2) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const freq = note(semitone);
  const partials: [number, number, number][] = [
    [1, 1, dur],
    [4, 0.16, dur * 0.22],
  ];
  for (const [ratio, level, d] of partials) {
    const osc = e.ctx.createOscillator();
    const gain = e.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol * level, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(gain);
    gain.connect(e.out);
    gain.connect(e.room);
    osc.start(t);
    osc.stop(t + d + 0.05);
  }
};

/** acorde de fundo: entra e sai devagar, dá calor sem chamar atenção */
const pad = (semitones: number[], at: number, dur: number, vol = 0.05) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const filter = e.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1100;
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.18, dur * 0.3));
  gain.gain.setValueAtTime(vol, t + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  filter.connect(gain);
  gain.connect(e.out);
  gain.connect(e.room);
  for (const s of semitones) {
    const osc = e.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = note(s);
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
};

/** batida grave e curta, como um toque de tambor abafado */
const thump = (at: number, vol = 0.2) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const osc = e.ctx.createOscillator();
  const gain = e.ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(52, t + 0.12);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  osc.connect(gain).connect(e.out);
  osc.start(t);
  osc.stop(t + 0.26);
};

/** ruído abafado: toque de madeira, chocalho suave ou sopro */
const breath = (at: number, dur: number, vol: number, from: number, to?: number) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const buffer = e.ctx.createBuffer(1, Math.ceil(e.ctx.sampleRate * dur), e.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = e.ctx.createBufferSource();
  src.buffer = buffer;
  const filter = e.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(from, t);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur * 0.4));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(e.out);
  src.start(t);
};

/** graus de uma escala pentatônica: sobe sem nunca soar tenso */
const climb = [0, 2, 4, 7, 9];

export const sfx = {
  /** toque em opção ou botão: um toque de madeira, quase só tátil */
  tap: () => {
    breath(0, 0.03, 0.09, 1500);
    mallet(G4, 0, 0.09, 0.11);
  },

  /** acerto: duas teclas de marimba subindo; sobe um grau a cada acerto seguido */
  correct: (combo = 1) => {
    const up = climb[Math.min(combo - 1, climb.length - 1)] ?? 0;
    mallet(C4 + up, 0, 0.35, 0.2);
    mallet(G4 + up, 0.09, 0.6, 0.2);
    pad([C4 + up, G4 + up], 0, 0.6, 0.03);
    if (combo >= 3) mallet(C5 + up, 0.2, 0.7, 0.14);
  },

  /** erro: duas teclas graves descendo, sem buzina nem susto */
  wrong: () => {
    mallet(E4, 0, 0.3, 0.16);
    mallet(A3, 0.13, 0.55, 0.18);
  },

  /** moeda: duas teclas curtas e um toque de chocalho */
  coin: () => {
    mallet(E5, 0, 0.18, 0.13);
    mallet(G5, 0.08, 0.45, 0.13);
    breath(0, 0.05, 0.03, 2400);
  },

  /** balão de conversa e pequenos destaques */
  pop: () => {
    mallet(A4, 0, 0.2, 0.16);
  },

  /** entrada em uma lição ou tela: um sopro que abre */
  whoosh: () => {
    breath(0, 0.38, 0.05, 280, 1500);
    pad([C4, G4], 0, 0.45, 0.025);
  },

  /** algo foi liberado */
  unlock: () => {
    mallet(G4, 0, 0.25, 0.15);
    mallet(C5, 0.1, 0.5, 0.15);
  },

  /** fim de lição: frase de marimba sobre um acorde, de acordo com o farol */
  finish: (sinal: "verde" | "amarelo" | "vermelho") => {
    if (sinal === "vermelho") {
      // incentivo curto e acolhedor
      pad([A3, E4], 0, 0.9, 0.04);
      mallet(A3, 0, 0.4, 0.16);
      mallet(C4, 0.2, 0.7, 0.16);
      return;
    }
    thump(0);
    pad([C4, E4, G4], 0, sinal === "verde" ? 2.4 : 1.4, 0.045);
    mallet(G4, 0.02, 0.3, 0.18);
    mallet(C5, 0.16, 0.3, 0.18);
    mallet(E5, 0.3, 0.55, 0.18);
    if (sinal === "amarelo") {
      mallet(C5, 0.5, 0.9, 0.14);
      return;
    }
    // verde: a frase continua e resolve no acorde
    mallet(G5, 0.46, 0.5, 0.17);
    mallet(E5, 0.72, 0.3, 0.14);
    mallet(G5, 0.86, 0.3, 0.14);
    thump(1.04, 0.16);
    pad([C4, G4, D5], 1.04, 1.6, 0.04);
    mallet(C5, 1.04, 1.3, 0.17);
    mallet(E5, 1.04, 1.3, 0.14);
    mallet(G5, 1.1, 1.3, 0.12);
  },

  /** subir de nível ou de divisão: arpejo subindo sobre um acorde */
  levelUp: () => {
    [C4, E4, G4, C5, E5].forEach((n, i) => mallet(n, i * 0.085, 0.4, 0.16));
    thump(0.44, 0.18);
    pad([C4, G4, E5], 0.44, 1.6, 0.045);
    mallet(G5, 0.44, 1.2, 0.15);
    mallet(C5, 0.44, 1.2, 0.13);
  },

  /** presente: batidas de madeira, com a expectativa subindo */
  giftShake: () => {
    for (let i = 0; i < 6; i++) {
      breath(i * 0.17, 0.06, 0.06, 1300 + (i % 2) * 400);
      mallet(C4 + (i % 2) * 2, i * 0.17, 0.09, 0.07);
    }
    pad([C4, G4], 0.1, 1.05, 0.03);
    breath(0.35, 0.75, 0.035, 250, 1300);
  },

  /** presente: abre com uma batida e uma frase curta que resolve */
  giftOpen: () => {
    thump(0, 0.24);
    breath(0, 0.3, 0.05, 400, 1800);
    pad([C4, E4, G4], 0, 1.9, 0.05);
    [G4, C5, E5, G5].forEach((n, i) => mallet(n, 0.04 + i * 0.09, 0.4, 0.17));
    thump(0.56, 0.14);
    mallet(C5, 0.56, 1.3, 0.16);
    mallet(E5, 0.56, 1.3, 0.14);
    mallet(G5, 0.62, 1.3, 0.12);
  },
};
