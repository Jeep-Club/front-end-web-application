"use client";

import { Logo } from "@/components/common/logo";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as Scroll from 'react-scroll';
const ScrollLink = Scroll.Link;
import {
  FaGift,
  FaWhatsapp,
  FaIdCard,
  FaUsers,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { GiJeep } from "react-icons/gi";
import { MdOutlineExplore, MdGroups, MdVolunteerActivism } from "react-icons/md";

export default function HomeClient() {
  const router = useRouter();

  const handleWhatsApp = () => {
    window.open("https://wa.me/NUMEROMATEHUS", "_blank");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white font-sans overflow-x-hidden">
      {/* ── HERO ── */}
      <section id="hero" className="relative min-h-screen md:min-h-[90vh] flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-jeep.jpg"
            alt="Hero Jeep"
            fill
            priority
            className="object-cover object-center md:object-[center_30%]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/90" />

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-8">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-[#00236F] text-white text-xs md:text-sm px-4 py-2.5 rounded-full transition-all active:scale-95 hover:bg-[#001a52] shadow-lg"
            >
              <FaIdCard size={14} />
              Sou membro
            </button>

            <Logo />
            
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 pb-24 md:pb-20 text-center flex-grow flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight mb-6 uppercase text-white">
            Jeep<br />Club<br />
            <span className="text-yellow-400">Tamoios</span>
          </h1>

          <div className="mb-8">
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-yellow-400 uppercase font-bold">Desde</p>
            <p className="text-xs md:text-sm text-white/90">09/09/1999</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 mx-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm md:text-base px-8 py-4 rounded-full transition-all active:scale-95 shadow-xl"
          >
            <FaWhatsapp size={20} />
            Entre em Contato
            <FaChevronRight size={12} />
          </button>
        </div>

        {/* Scroll down trigger */}
        <ScrollLink
          to="experiencias"
          smooth
          duration={600}
          className="relative pb-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20"
        >
          <p className="text-[9px] tracking-widest text-white uppercase mb-2">Role para baixo</p>
          <FaChevronDown size={18} className="text-yellow-400 animate-bounce" />
        </ScrollLink>
      </section>

      {/* ── EXPERIÊNCIAS ── */}
      <section id="experiencias" className="px-6 py-16 md:py-24 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] tracking-[0.2em] text-yellow-400 uppercase mb-2 font-bold">Nossas Experiências</p>
          <p className="text-xl md:text-2xl text-white/70 italic mb-10">Onde o asfalto termina, a vida começa.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-3xl overflow-hidden bg-[#1a1a1a] border border-white/5 flex flex-col">
              <div className="relative h-64 md:h-80">
                <Image src="/images/Expe_jeep.jpg" alt="Expedições" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MdOutlineExplore size={20} className="text-yellow-400" />
                  <h3 className="text-xl font-bold">Expedições & Trilhas</h3>
                </div>
                <p className="text-sm md:text-base text-white/50 leading-relaxed">
                  Trilhas icônicas do Litoral Norte. De passeios leves a desafios técnicos extremos em meio à Mata Atlântica.
                </p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden bg-[#1a1a1a] border border-white/5 flex flex-col">
              <div className="relative h-64 md:h-80">
                <Image src="/images/Events-jeep.jpg" alt="Eventos" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaUsers size={20} className="text-yellow-400" />
                  <h3 className="text-xl font-bold">Eventos & Encontros</h3>
                </div>
                <p className="text-sm md:text-base text-white/50 leading-relaxed">
                  Muito mais que carros — celebramos a amizade com encontros gastronômicos e workshops técnicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEGADO ── */}
      <section id="legado" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.2em] text-blue-900 uppercase mb-3 font-black">
              Legado & Tradição
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-950 leading-tight mb-6">
              Jeep Club Tamoios:<br />
              <span className="font-light">Tradição no Litoral Norte</span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-10">
              Fundado em 1999, o Tamoios nasceu da paixão pela natureza e pela mecânica robusta.
              Ao longo de mais de duas décadas, transformamos o off-road em uma ferramenta de
              exploração consciente e união comunitária.
            </p>
            <div className="grid grid-cols-3 gap-4 md:gap-10">
              <div>
                <p className="text-3xl md:text-4xl font-black text-yellow-500">27</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Anos</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-yellow-500">60+</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Membros</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-yellow-500">100+</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Trilhas</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <Image
                src="/images/logo_grande.jpg"
                alt="Jeep Club Tamoios"
                width={320}
                height={320}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACTO SOCIAL ── */}
      <section id="impacto" className="px-6 py-20 bg-[#0d2c6c] text-white">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs tracking-[0.25em] text-yellow-400 uppercase mb-4 font-black">
            Impacto Social
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Off-Road com Propósito</h2>
          <p className="text-base md:text-lg text-white/70 leading-relaxed">
            Nossa tração 4x4 serve para chegar onde ninguém mais chega. A solidariedade é o nosso combustível principal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: <MdGroups size={26} />, title: "Apoio em Calamidades", text: "Logística e transporte de mantimentos em áreas isoladas por chuvas no Litoral Norte." },
            { icon: <FaGift size={24} />, title: "Dia das Crianças", text: "Tradicional caravana de entrega de brinquedos e cestas básicas para comunidades." },
            { icon: <MdVolunteerActivism size={26} />, title: "Doações Regulares", text: "Apoio contínuo a instituições locais de assistência social e proteção ambiental." }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-yellow-400">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 bg-[#f5f7fb]">
        <div className="max-w-5xl mx-auto bg-yellow-400 rounded-[2.5rem] overflow-hidden relative p-8 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-[#00236F] leading-tight mb-4">
              Pronto para a sua<br className="hidden md:block" />próxima aventura?
            </h2>
            <p className="text-base text-[#00236F]/80 mb-8 font-medium">
              Junte-se à maior família off-road do Litoral Norte.
            </p>
            <button
              onClick={handleRegister}
              className="flex items-center gap-3 mx-auto md:mx-0 bg-[#00236F] text-white font-bold text-sm md:text-base px-8 py-4 rounded-full hover:bg-[#001a52] transition-all active:scale-95 shadow-lg"
            >
              <FaIdCard size={18} />
              Quero ser Sócio
              <FaChevronRight size={14} />
            </button>
          </div>

          <div className="mt-10 md:mt-0 md:absolute md:right-[-20px] md:bottom-[-20px] opacity-10 md:opacity-20 pointer-events-none">
            <GiJeep size={280} className="text-[#00236F]" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <GiJeep size={24} className="text-yellow-400" />
            <p className="text-lg text-white font-bold tracking-tight">Jeep Club Tamoios</p>
          </div>
          <p className="text-xs text-white/30 mb-8">© 2026 Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {["Política de Privacidade", "Termos de Uso", "Contato"].map((link) => (
              <a key={link} href="#" className="text-xs text-white/40 hover:text-yellow-400 transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}