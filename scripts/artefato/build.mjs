import { build } from "esbuild";
import fs from "node:fs";
import { execSync } from "node:child_process";
const R = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const here = new URL(".", import.meta.url).pathname;
const globals = {
  name: "cdn-globals",
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client|react\/jsx-runtime)$/ }, (a) => ({ path: a.path, namespace: "cdn" }));
    b.onLoad({ filter: /.*/, namespace: "cdn" }, (a) => {
      if (a.path === "react") return { contents: "module.exports = window.React" };
      if (a.path === "react/jsx-runtime")
        return { contents: "const R = window.React; const el = (t, p, k) => R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); module.exports = { jsx: el, jsxs: el, Fragment: R.Fragment };" };
      return { contents: "module.exports = window.ReactDOM" };
    });
  },
};
const out = await build({
  entryPoints: [here + "entry.tsx"],
  bundle: true, minify: true, write: false, format: "iife", target: "es2019",
  jsx: "automatic",
  nodePaths: [R + "/node_modules"],
  alias: { "~": R + "/src", "next/link": here + "shims/link.tsx", "next/router": here + "shims/router.ts", "next/head": here + "shims/head.tsx" },
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_FAROL_API_URL": '""' },
  plugins: [globals],
  logLevel: "warning",
});
let js = out.outputFiles[0].text;
const logo = "data:image/png;base64," + fs.readFileSync(R + "/public/farol/logo-open.png").toString("base64");
const n = js.split("/farol/logo-open.png").length - 1;
js = js.split("/farol/logo-open.png").join(logo);
execSync(`cd ${R} && npx tailwindcss -c tailwind.config.ts -i src/styles/globals.css -o ${here}app.css --minify`, { stdio: "pipe" });
const css = fs.readFileSync(here + "app.css", "utf8");
const html = `<title>Vendê</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;800&family=IBM+Plex+Sans:wght@400;500;600&family=Nunito:wght@700;800;900&display=swap">
<style>
/* Vendê: app de treino de vendas. Tema único escuro do Meu Farol, rosa Open como destaque. */
:root{--vd-bg:#1b1c20;--vd-surface:#24252b;--vd-line:#383a43;--vd-ink:#ffffff;--vd-muted:#a6a8b2;--vd-accent:#ff0084;color-scheme:dark}
html,body{background:var(--vd-bg);color:var(--vd-ink)}
.tp{background:var(--vd-surface);border-bottom:1px solid var(--vd-line);font:500 13px "IBM Plex Sans",system-ui,sans-serif;padding:6px 16px;position:relative;z-index:30}
@media (min-width:768px){.tp{margin-left:5rem}}
@media (min-width:1024px){.tp{margin-left:15rem}}
.tp-toggle{color:var(--vd-muted);font-weight:600;letter-spacing:.06em;text-transform:uppercase;font-size:11px;padding:4px 0}
.tp-body{padding:6px 0 4px;display:flex;flex-direction:column;gap:8px}
.tp-actions{display:flex;flex-wrap:wrap;gap:6px}
.tp-actions button{border:1px solid var(--vd-accent);color:var(--vd-accent);border-radius:8px;padding:5px 10px;font-weight:600}
.tp-actions button:hover{background:rgba(255,0,132,.12)}
.tp p{color:var(--vd-ink);margin:0}
.tp button:focus-visible{outline:2px solid var(--vd-accent);outline-offset:2px}
${css}
</style>
<div id="vende-root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${js.replace(/<\/script/gi, "<\\/script")}</script>
`;
fs.writeFileSync(here + "vende.html", html);
console.log("logo refs", n, "| js", (js.length / 1024).toFixed(0) + "KB", "| css", (css.length / 1024).toFixed(0) + "KB", "| html", (html.length / 1024).toFixed(0) + "KB");
