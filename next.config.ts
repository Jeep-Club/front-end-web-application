import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // remove consoles apenas quando rodar em produção
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      // remover quando o Avatar do header parar de usar a foto mockada e passar a receber a URL real do usuário
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
