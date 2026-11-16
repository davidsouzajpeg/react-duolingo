/**
 * VOZ — ouvir o cliente e responder falando
 *
 * Ouvir: lê a mensagem do cliente em voz alta.
 * Falar: transcreve a fala do vendedor (ditado), para ele não precisar digitar.
 *
 * Usa os recursos de voz do próprio aparelho/navegador (sem chave de API e
 * sem servidor). Onde o navegador não oferece o recurso, `canSpeak` /
 * `canListen` ficam falsos e a tela esconde os botões.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

type Unsub = () => void;
type HostTts = {
  speak: (text: string, opts?: { language?: string }) => Promise<void>;
  stop: () => Promise<void>;
};
type HostDictation = {
  start: (opts?: { language?: string }) => Promise<void>;
  stop: () => Promise<void>;
  onPartial: (fn: (e: { text: string }) => void) => Unsub;
  onFinal: (fn: (e: { text: string }) => void) => Unsub;
  onState: (fn: (e: { state: string; reason?: string }) => void) => Unsub;
};

/** recursos de voz oferecidos pela página hospedeira (quando existem) */
const hostUse = async <T,>(name: string): Promise<T | null> => {
  try {
    const host = (window as any).claude;
    if (!host?.use) return null;
    return ((await host.use(name)) as T | null) ?? null;
  } catch {
    return null;
  }
};

const browserRecognition = (): any =>
  typeof window === "undefined"
    ? null
    : (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;

const ptVoice = () => {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang === "pt-BR") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    null
  );
};

export type ListenError = "negado" | "indisponivel" | "silencio" | null;

export const useVoz = () => {
  const tts = useRef<HostTts | null>(null);
  const dictation = useRef<HostDictation | null>(null);
  const recognition = useRef<any>(null);
  const heard = useRef("");
  const onResult = useRef<((text: string) => void) | null>(null);

  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  /** texto que está sendo lido agora (para acender o botão certo) */
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [listenError, setListenError] = useState<ListenError>(null);

  const deliver = useCallback(() => {
    setListening(false);
    setPartial("");
    const text = heard.current.trim();
    heard.current = "";
    const cb = onResult.current;
    onResult.current = null;
    if (!cb) return;
    if (text) cb(text);
    else setListenError((e) => e ?? "silencio");
  }, []);

  useEffect(() => {
    let alive = true;
    const unsubs: Unsub[] = [];
    setCanSpeak("speechSynthesis" in window);
    setCanListen(!!browserRecognition());
    // as vozes do navegador carregam depois; pedir uma vez já adianta
    window.speechSynthesis?.getVoices();

    void hostUse<HostTts>("tts").then((t) => {
      if (!alive || !t) return;
      tts.current = t;
      setCanSpeak(true);
    });
    void hostUse<HostDictation>("dictation").then((d) => {
      if (!alive || !d) return;
      dictation.current = d;
      setCanListen(true);
      unsubs.push(
        d.onPartial(({ text }) => setPartial(`${heard.current} ${text}`.trim())),
        d.onFinal(({ text }) => {
          heard.current = `${heard.current} ${text}`.trim();
          setPartial(heard.current);
        }),
        d.onState(({ state, reason }) => {
          if (state === "listening") setListening(true);
          if (state === "idle") {
            if (reason === "not_granted") setListenError("negado");
            else if (reason === "unavailable" || reason === "upstream_error") setListenError("indisponivel");
            deliver();
          }
        }),
      );
    });

    return () => {
      alive = false;
      unsubs.forEach((u) => u());
      window.speechSynthesis?.cancel();
      void tts.current?.stop().catch(() => undefined);
      void dictation.current?.stop().catch(() => undefined);
      try {
        recognition.current?.abort();
      } catch {
        /* já parado */
      }
    };
  }, [deliver]);

  const stopSpeaking = useCallback(() => {
    setSpeaking(null);
    void tts.current?.stop().catch(() => undefined);
    window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text: string) => {
    setSpeaking(text);
    const done = () => setSpeaking((s) => (s === text ? null : s));
    if (tts.current) {
      tts.current.speak(text, { language: "pt-BR" }).then(done, done);
      return;
    }
    if (!("speechSynthesis" in window)) return done();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    const voice = ptVoice();
    if (voice) u.voice = voice;
    u.rate = 1.02;
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  }, []);

  /** precisa ser chamado direto do toque no botão (exigência do navegador) */
  const startListening = useCallback(
    (cb: (text: string) => void) => {
      stopSpeaking();
      heard.current = "";
      onResult.current = cb;
      setPartial("");
      setListenError(null);
      setListening(true);

      if (dictation.current) {
        dictation.current.start({ language: "pt-BR" }).catch((e: { code?: string }) => {
          if (e?.code === "not_granted") setListenError("negado");
          else if (e?.code !== "dismissed" && e?.code !== "stopped") setListenError("indisponivel");
          onResult.current = null;
          setListening(false);
        });
        return;
      }

      const Recognition = browserRecognition();
      if (!Recognition) {
        setListenError("indisponivel");
        setListening(false);
        return;
      }
      const rec = new Recognition();
      recognition.current = rec;
      rec.lang = "pt-BR";
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript as string;
          if (event.results[i].isFinal) final += ` ${piece}`;
          else interim += ` ${piece}`;
        }
        heard.current = final.trim();
        setPartial(`${final} ${interim}`.trim());
      };
      rec.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") setListenError("negado");
        else if (event.error !== "no-speech" && event.error !== "aborted") setListenError("indisponivel");
      };
      rec.onend = () => {
        // o que ainda estava como "parcial" também vale
        setPartial((p) => {
          if (!heard.current && p) heard.current = p;
          return p;
        });
        deliver();
      };
      try {
        rec.start();
      } catch {
        setListenError("indisponivel");
        setListening(false);
      }
    },
    [deliver, stopSpeaking],
  );

  const stopListening = useCallback(() => {
    if (dictation.current) void dictation.current.stop().catch(() => undefined);
    else recognition.current?.stop();
  }, []);

  return {
    canSpeak,
    canListen,
    speaking,
    speak,
    stopSpeaking,
    listening,
    partial,
    listenError,
    startListening,
    stopListening,
  };
};

/* -------------------- Encaixar a fala em uma das respostas -------------------- */

const stop = new Set(
  "a o e de da do das dos um uma para pra com que se em no na nos nas por eu voce me te lhe ele ela isso esse essa este esta e ou mas como ja nao sim os as ao aos meu minha seu sua la aqui so muito mais bem entao ne ta".split(
    " ",
  ),
);

const tokens = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stop.has(w))
    // radical simples: tolera plural e conjugação diferentes
    .map((w) => (w.length > 5 ? w.slice(0, 5) : w));

/**
 * Compara o que o vendedor falou com as respostas possíveis e devolve a mais
 * parecida (pelo vocabulário em comum). `sure` indica se dá para confiar.
 */
export const matchSpeech = (spoken: string, options: string[]) => {
  const said = new Set(tokens(spoken));
  const scores = options.map((option) => {
    const words = new Set(tokens(option));
    if (!said.size || !words.size) return 0;
    let common = 0;
    said.forEach((w) => words.has(w) && common++);
    return (2 * common) / (said.size + words.size);
  });
  const ranked = scores.map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
  const best = ranked[0]!;
  const second = ranked[1]?.score ?? 0;
  return {
    index: best.index,
    score: best.score,
    sure: best.score >= 0.2 && best.score - second >= 0.06,
  };
};
