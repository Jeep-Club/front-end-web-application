"use client";

import { useRouter } from "next/navigation";
import {
  FaGift,
  FaWhatsapp,
  FaIdCard,
  FaMapMarkedAlt,
  FaUsers,
  FaHeart,
  FaTruck,
  FaListUl,
  FaShieldAlt,
  FaChevronRight,
  FaChevronDown,
  FaStar,
} from "react-icons/fa";
import { GiJeep, GiMountainRoad, GiCampfire } from "react-icons/gi";
import { MdOutlineExplore, MdGroups, MdVolunteerActivism } from "react-icons/md";

export default function HomePage() {
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

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white font-sans">
      <section className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-jeep.jpg')] bg-cover bg-[center_30%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
        
        <div className="relative z-10 flex items-center justify-between px-5 pt-6">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-[#00236F] text-white text-sm px-4 py-2 rounded-full transition-all active:scale-95 hover:bg-[#001a52]"
            >
              <FaIdCard size={14} />
              Sou membro
            </button>

            <div className="w-11 h-11 overflow-hidden border border-white/10 rounded-full">
              <img
                src="/favicon.ico"
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 pb-20 text-center">
          <h1 className="text-5xl font-black leading-none tracking-tight mb-4 uppercase text-white">
            Jeep<br />Club<br />
            <span className="text-yellow-400">Tamoios</span>
          </h1>

          <div className="mb-10">
            <p className="text-[10px] tracking-[0.2em] text-yellow-400 uppercase">
              Desde
            </p>
            <p className="text-[11px] text-white/80">
              09/09/1999
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 mx-auto bg-yellow-500 hover:bg-yellow-200 text-black font-semibold text-sm px-6 py-3 rounded-full transition-all active:scale-95"
          >
            <FaWhatsapp size={18} />
            Entre em Contato
            <FaChevronRight size={12} />
          </button>
        </div>
        <div 
          onClick={scrollToNextSection}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20"
        >
          <p className="text-[10px] tracking-widest text-white uppercase mb-2">
            Role para baixo
          </p>
          <FaChevronDown size={20} className="text-yellow-400 animate-bounce" />
        </div>
      </section>

      <section className="px-5 py-10 bg-[#111]">
        <p className="text-[10px] tracking-[0.2em] text-yellow-400 uppercase mb-1">Nossas Experiências</p>
        <p className="text-lg text-white/60 italic mb-6">Onde o asfalto termina, a vida começa.</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5">
            <div className="h-80 bg-[#222] flex items-center justify-center overflow-hidden">
              <img 
                src="/images/Expe_jeep.jpg" 
                alt="icon" 
                className="w-full h-full object-cover" 
              />            
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <MdOutlineExplore size={14} className="text-yellow-400" />
                <p className="text-2x1 font-semibold">Expedições & Trilhas</p>
              </div>
              <p className="text-[15px] text-white/50 leading-relaxed">
                Trilhas icônicas do Litoral Norte. De passeios leves a desafios técnicos extremos.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5">
            <div className="h-80 bg-[#222] flex items-center justify-center overflow-hidden">
              <img 
                src="/images/Events-jeep.jpg" 
                alt="icon" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <FaUsers size={12} className="text-yellow-400" />
                <p className="text-2x1 font-semibold">Eventos & Encontros</p>
              </div>
              <p className="text-[15px] text-white/50 leading-relaxed">
                Muito mais que carros — celebramos a amizade com encontros e workshops técnicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-blue-900 uppercase mb-3 font-semibold">
              Legado & Tradição
            </p>

            <h2 className="text-4xl font-semibold text-blue-900 leading-tight mb-5">
              Jeep Club Tamoios:<br />
              <span className="font-normal">
                Tradição no Litoral Norte
              </span>
            </h2>

            <p className="text-[15px] text-gray-600 leading-relaxed mb-8 max-w-md">
              Fundado em 1999, o Tamoios nasceu da paixão pela natureza e pela mecânica robusta.
              Ao longo de mais de três décadas, transformamos o off-road em uma ferramenta de
              exploração consciente e união comunitária em Caraguatatuba e região.
            </p>

            <div className="flex gap-10">
              <div>
                <p className="text-3xl font-bold text-yellow-500">27</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Anos de estrada
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-yellow-500">60+</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Membros ativos
                </p>
              </div>

              <div>
                <p className="text-3xl font-bold text-yellow-500">100+</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Trilhas mapeadas
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative flex justify-center">
            <div className="relative bg-white rounded-xl shadow-lg p-4">
              <img
                src="/images/logo_grande.jpg" 
                alt="Jeep Club Tamoios"
                className="w-[300px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-[#0d2c6c] text-white">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.25em] text-yellow-400 uppercase mb-3 font-semibold">
            Impacto Social
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Off-Road com Propósito
          </h2>

          <p className="text-base text-white/70 leading-relaxed">
            Nossa tração 4x4 serve para chegar onde ninguém mais chega quando a comunidade mais precisa. 
            A solidariedade é o nosso combustível principal.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
              <MdGroups size={24} className="text-yellow-400" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              Apoio em Calamidades
            </h3>

            <p className="text-sm text-white/70 leading-relaxed">
              Logística e transporte de mantimentos em áreas isoladas por chuvas ou deslizamentos no Litoral Norte.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
              <FaGift size={22} className="text-yellow-400" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              Dia das Crianças Off-Road
            </h3>

            <p className="text-sm text-white/70 leading-relaxed">
              Tradicional caravana de entrega de brinquedos e cestas básicas para comunidades.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left hover:bg-white/10 transition">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4">
              <MdVolunteerActivism size={24} className="text-yellow-400" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              Doações Regulares
            </h3>

            <p className="text-sm text-white/70 leading-relaxed">
              Mantemos um calendário fixo de apoio a instituições locais de assistência social e proteção ambiental.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 bg-[#f5f7fb]">
        <div className="max-w-5xl mx-auto bg-yellow-400 rounded-3xl overflow-hidden relative p-10 md:p-14 flex flex-col md:flex-row items-center justify-between">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-[#00236F] leading-tight mb-3">
              Pronto para a sua<br />próxima aventura?
            </h2>

            <p className="text-sm md:text-base text-[#00236F]/80 mb-6">
              Junte-se à maior família off-road do Litoral Norte.
            </p>

            <button
              onClick={handleRegister}
              className="flex items-center gap-2 bg-[#00236F] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#001a52] transition-all active:scale-95"
            >
              <FaIdCard size={14} />
              Quero ser Sócio
              <FaChevronRight size={12} />
            </button>
          </div>

          <div className="absolute right-[-6px] bottom-[-0px] opacity-10">
            <GiJeep size={220} className="text-[#00236F]" />
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 bg-[#0a0a0a] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GiJeep size={18} className="text-yellow-400" />
          <p className="text-sm text-white/60 font-semibold">Jeep Club Tamoios</p>
        </div>
        <p className="text-[11px] text-white/30 mb-4">© 2026 Todos os direitos reservados.</p>
        <div className="flex justify-center gap-4">
          {["Politica", "Termos de Serviços", "Contato"].map((link) => (
            <a key={link} href="#" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}