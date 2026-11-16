/**
 * Gera o Vendê como site estático, pronto para subir em hospedagem comum.
 *
 *   node scripts/exportar.mjs            → publica na raiz de um (sub)domínio
 *   VENDE_BASE_PATH=/vende node scripts/exportar.mjs   → publica em subpasta
 *
 * Resultado: pasta `out/` e o arquivo `vende-site.zip` (o conteúdo do zip vai
 * direto para a pasta pública do domínio, ex.: public_html).
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";

const basePath = process.env.VENDE_BASE_PATH ?? "";
// scripts e estilos ficam numa pasta com a data da publicação (ver next.config.mjs)
const assetDir = `v${new Date().toISOString().replace(/\D/g, "").slice(0, 12)}`;
execSync("npx next build", {
  stdio: "inherit",
  env: {
    ...process.env,
    VENDE_EXPORT: "1",
    VENDE_ASSET_DIR: assetDir,
    SKIP_ENV_VALIDATION: "1",
    // login e progresso no servidor (servidor/api); VENDE_SEM_CONTA=1 publica sem login
    NEXT_PUBLIC_VENDE_API: process.env.VENDE_SEM_CONTA === "1" ? "" : `${basePath}/api/index.php`,
  },
});
mkdirSync(`out/${assetDir}`, { recursive: true });
renameSync("out/_next", `out/${assetDir}/_next`);

// páginas do projeto-base que não fazem parte do Vendê
for (const legacy of ["learn", "lesson", "leaderboard", "profile", "shop", "register", "forgot-password", "settings"]) {
  rmSync(`out/${legacy}`, { recursive: true, force: true });
  rmSync(`out/${legacy}.html`, { force: true });
}

// API em PHP (o config.php com as credenciais existe só no servidor)
if (process.env.VENDE_SEM_CONTA !== "1") {
  cpSync("servidor/api", "out/api", { recursive: true, filter: (f) => !f.endsWith("config.php") });
}

// a entrada do domínio leva direto para o app
writeFileSync(
  "out/index.html",
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Vendê</title>
<meta http-equiv="refresh" content="0; url=${basePath}/farol/"><meta name="theme-color" content="#1b1c20">
<style>body{background:#1b1c20}</style></head><body><script>location.replace("${basePath}/farol/")</script></body></html>\n`,
);

// Apache/LiteSpeed (Hostinger): página de erro e cache dos arquivos com hash
writeFileSync(
  "out/.htaccess",
  `ErrorDocument 404 ${basePath}/404.html
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2?)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
`,
);

if (existsSync("vende-site.zip")) rmSync("vende-site.zip");
execSync("cd out && zip -qr ../vende-site.zip . -x '*.DS_Store'", { stdio: "inherit" });
console.log(`\nPronto: pasta out/ e vende-site.zip (arquivos em ${assetDir}/)`);
console.log("Ao enviar arquivo por arquivo, suba as páginas .html por último.");
