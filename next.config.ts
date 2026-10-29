import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "crispy-enigma-4jqg6qg66q6pfqvwj-3000.app.github.dev",
    "*.app.github.dev",
  ],

  experimental: {
    serverActions: {
      // O limite de arquivo continua em 5 MiB; cinco arquivos mais o envelope multipart cabem em 30 MiB.
      bodySizeLimit: "30mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "crispy-enigma-4jqg6qg66q6pfqvwj-3000.app.github.dev",
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
