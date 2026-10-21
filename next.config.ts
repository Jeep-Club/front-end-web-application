import type { NextConfig } from "next";
import { readLocalUrl } from "./config/local-urls.cjs";

// As permissões locais acompanham as portas configuradas, sem exigir variáveis locais no deploy.
const localOrigins = ["APP_URL", "PLAYWRIGHT_APP_URL"]
  .filter((name) => process.env[name])
  .flatMap((name) => {
    const url = readLocalUrl(name);
    return [url.host, `${url.hostname === "localhost" ? "127.0.0.1" : "localhost"}:${url.port || "80"}`];
  });

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.app.github.dev",
  ],

  experimental: {
    serverActions: {
      // O limite de arquivo continua em 5 MiB; a margem cobre o envelope multipart do Server Action.
      bodySizeLimit: "8mb",
      allowedOrigins: [
        ...localOrigins,
        "*.app.github.dev",
      ],
    },
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
