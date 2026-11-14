/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
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
export default config;
