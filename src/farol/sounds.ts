/**
 * Sons do Vendê, sintetizados na hora com Web Audio (sem arquivos de áudio).
 *
 * Caráter: discreto e limpo. Tons puros (senoidais), curtos e baixos de
 * volume, com uma reverberação pequena. Referências de medida, tiradas da
 * análise de um app de aprendizagem conhecido: o som de acerto dura cerca de
 * 0,3 s e tem duas notas puras; o de erro são dois tons graves e curtos; o de
 * fim de lição dura cerca de 1,5 s. As melodias e os intervalos são do Vendê.
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

/** sino de vidro: tom puro com um harmônico bem fraco, ataque macio e cauda curta */
const bell = (freq: number, at: number, dur = 0.3, vol = 0.12) => {
  const e = engine();
  if (!e) return;
  const t = e.ctx.currentTime + at;
  const partials: [number, number, number][] = [
    [1, 1, dur],
    [2, 0.07, dur * 0.4],
  ];
  for (const [ratio, level, d] of partials) {
    const osc = e.ctx.createOscillator();
    const gain = e.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol * level, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(gain);
    gain.connect(e.out);
    gain.connect(e.room);
    osc.start(t);
    osc.stop(t + d + 0.05);
  }
};

// notas usadas nas melodias (Hz)
const N = {
  G3: 196, C4: 261.6, E4: 329.6, G4: 392, A4: 440,
  C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5, D6: 1174.7, E6: 1318.5,
};

/** a cada acerto seguido o som sobe um pouco, sem passar de um tom e meio */
const climb = [1, 1.06, 1.122, 1.19];

export const sfx = {
  /** toque em opção ou botão: um ponto de som, quase só tátil */
  tap: () => {
    bell(N.G5, 0, 0.06, 0.1);
  },

  /** acerto: duas notas puras subindo, curtas e discretas */
  correct: (combo = 1) => {
    const k = climb[Math.min(combo - 1, climb.length - 1)] ?? 1;
    bell(N.G5 * k, 0, 0.16, 0.12);
    bell(N.C6 * k, 0.12, 0.28, 0.12);
    if (combo >= 3) bell(N.E6 * k, 0.24, 0.3, 0.07);
  },

  /** erro: dois tons graves e curtos */
  wrong: () => {
    bell(N.G3, 0, 0.2, 0.2);
    bell(N.G3 * 0.84, 0.19, 0.3, 0.2);
  },

  /** moeda: duas notas rápidas */
  coin: () => {
    bell(N.E5, 0, 0.1, 0.1);
    bell(N.A5, 0.08, 0.3, 0.1);
  },

  /** balão de conversa e pequenos destaques */
  pop: () => {
    bell(N.A4, 0, 0.12, 0.1);
  },

  /** entrada em uma lição ou tela: um sopro que abre */
  whoosh: () => {
    breath(0, 0.34, 0.4, 280, 1400);
  },

  /** algo foi liberado */
  unlock: () => {
    bell(N.E5, 0, 0.14, 0.11);
    bell(N.A5, 0.11, 0.32, 0.11);
  },

  /** a chama acende: sopro grave que sobe e uma nota */
  ignite: () => {
    breath(0, 0.9, 0.07, 180, 1100);
    pad([-9, -2], 0.1, 1.1, 0.035);
    bell(N.C5, 0.55, 0.5, 0.1);
    bell(N.G5, 0.68, 0.7, 0.09);
  },

  /** fim de lição: frase curta, de cerca de um segundo e meio */
  finish: (sinal: "verde" | "amarelo" | "vermelho") => {
    if (sinal === "vermelho") {
      bell(N.G4, 0, 0.3, 0.12);
      bell(N.C5, 0.18, 0.55, 0.12);
      return;
    }
    pad([-9, -5, -2], 0, sinal === "verde" ? 1.5 : 1.0, 0.03);
    bell(N.C5, 0, 0.2, 0.11);
    bell(N.E5, 0.12, 0.2, 0.11);
    bell(N.G5, 0.24, 0.3, 0.11);
    if (sinal === "amarelo") {
      bell(N.E5, 0.44, 0.6, 0.1);
      return;
    }
    bell(N.C6, 0.4, 0.3, 0.11);
    bell(N.A5, 0.58, 0.18, 0.09);
    bell(N.C6, 0.72, 0.8, 0.11);
    bell(N.E5, 0.72, 0.8, 0.08);
    bell(N.G5, 0.72, 0.8, 0.08);
  },

  /** subir de nível ou de divisão */
  levelUp: () => {
    pad([-9, -2, 7], 0.3, 1.2, 0.03);
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => bell(f, i * 0.09, 0.25, 0.11));
    bell(N.E6, 0.4, 0.9, 0.08);
    bell(N.C6, 0.4, 0.9, 0.09);
    bell(N.G5, 0.4, 0.9, 0.08);
  },

  /** presente: batidas de madeira, com a expectativa subindo */
  giftShake: () => {
    for (let i = 0; i < 6; i++) {
      breath(i * 0.17, 0.05, 0.05, 1100 + (i % 2) * 300);
      bell(N.C4 * (1 + (i % 2) * 0.12), i * 0.17, 0.07, 0.07);
    }
    breath(0.35, 0.75, 0.03, 250, 1200);
  },

  /** presente: abre com um sopro e uma frase curta que resolve */
  giftOpen: () => {
    breath(0, 0.3, 0.05, 400, 1600);
    pad([-9, -5, -2], 0, 1.4, 0.035);
    [N.G4, N.C5, N.E5, N.G5].forEach((f, i) => bell(f, 0.03 + i * 0.085, 0.22, 0.11));
    bell(N.C6, 0.42, 0.9, 0.11);
    bell(N.E5, 0.42, 0.9, 0.08);
    bell(N.G5, 0.42, 0.9, 0.08);
  },
};
