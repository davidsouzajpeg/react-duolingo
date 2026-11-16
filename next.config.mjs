/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/**
 * `VENDE_EXPORT=1` gera o app como arquivos estáticos (pasta `out/`), para
 * hospedagem comum (Hostinger, por exemplo). Nesse modo não existem
 * redirecionamentos nem idiomas do Next: quem cuida disso é
 * `scripts/exportar.mjs`. `VENDE_BASE_PATH` serve para publicar em subpasta.
 */
const exportMode = process.env.VENDE_EXPORT === "1";

/** @type {import("next").NextConfig} */
const base = {
  reactStrictMode: true,

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["pt-BR"],
    defaultLocale: "pt-BR",
  },
  /**
   * O app publicado é o Vendê (/farol). As páginas antigas do projeto-base
   * continuam no repositório, mas não ficam acessíveis.
   */
  async redirects() {
    const legacy = [
      "/",
      "/learn",
      "/lesson",
      "/leaderboard",
      "/profile",
      "/shop",
      "/register",
      "/forgot-password",
      "/settings/:path*",
    ];
    return legacy.map((source) => ({
      source,
      destination: "/farol",
      permanent: false,
    }));
  },
  images: {
    unoptimized: exportMode,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placekitten.com",
        port: "",
        pathname: "/100/100",
      },
    ],
  },
};

const { i18n: _i18n, redirects: _redirects, ...staticBase } = base;

/** @type {import("next").NextConfig} */
const config = exportMode
  ? {
      ...staticBase,
      output: "export",
      trailingSlash: true,
      basePath: process.env.VENDE_BASE_PATH || undefined,
      // pasta de arquivos com versão: cada publicação tem endereços novos,
      // então nenhum navegador reaproveita um arquivo antigo ou incompleto
      assetPrefix: process.env.VENDE_ASSET_DIR
        ? `${process.env.VENDE_BASE_PATH ?? ""}/${process.env.VENDE_ASSET_DIR}`
        : undefined,
    }
  : base;
export default config;
