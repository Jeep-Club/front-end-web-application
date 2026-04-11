import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Loading from "@/components/common/loading";
import Providers from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JeepClub Tamoios",
  description: "JeepClub Tamoios. O clube é dedicado a promover a paixão por jipes e a camaradagem entre os entusiastas de veículos off-road. Com uma comunidade ativa e eventos regulares, o JeepClub Tamoios oferece aos seus membros a oportunidade de explorar trilhas desafiadoras, compartilhar experiências e celebrar a cultura dos jipes. Seja você um iniciante ou um veterano, o JeepClub Tamoios é o lugar ideal para se conectar com outros amantes de jipes e desfrutar de aventuras emocionantes na natureza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Suspense fallback={<Loading />}>
          <Providers>
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
