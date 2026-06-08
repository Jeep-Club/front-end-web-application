import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Remove consoles apenas quando rodar em produção
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
