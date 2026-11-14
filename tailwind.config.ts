import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Tokens do Meu Farol (Open) — usados apenas no módulo /farol */
        farol: {
          bg: "#1b1c20",
          surface: "#24252b",
          surface2: "#2d2f36",
          ink: "#ffffff",
          muted: "#a6a8b2",
          line: "#383a43",
          accent: "#ff0084",
          "accent-dark": "#c4006a",
          "accent-soft": "#3a1f2e",
          ok: "#3fcf86",
          "ok-dark": "#2a9c63",
          "ok-soft": "#1b3a2b",
          warn: "#f5b331",
          "warn-dark": "#b9841c",
          "warn-soft": "#3d3218",
          bad: "#ff5a4f",
          "bad-dark": "#c8382f",
          "bad-soft": "#40221f",
          lamp: "#121317",
          papel: "#f7f4f5",
        },
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        num: ["Nunito", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "farol-feixe": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "farol-pulso": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.06)" },
        },
      },
      animation: {
        "farol-feixe": "farol-feixe 14s linear infinite",
        "farol-pulso": "farol-pulso 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
