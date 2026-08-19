'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import FormLogin from "./form";
import { Logo } from "@/components/common/logo";
import { useModal } from "@/providers/ModalProvider";
import { JoinClubModal } from "./JoinClubModal";
import { usePageTour } from "@/hooks/useTour";
import { getLoginTourSteps } from "@/config/tourSteps";

export default function Login() {
    const router = useRouter();
    const { setContent, setOpen } = useModal();

    // Tour sob demanda para a tela de login (não auto-inicia, adaptado para mobile e desktop)
    const { startTour } = usePageTour({
        steps: getLoginTourSteps,
        autoStartOnFirstVisit: false,
    });

    const handleOpenJoinClub = () => {
        setContent(<JoinClubModal />);
        setOpen();
    };

    return (
        <div className="z-10 flex flex-col relative items-center w-full max-w-150">
            {/* Botão Voltar */}
            <button
                type="button"
                onClick={() => router.back()}
                className="fixed top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-20 flex items-center gap-1 text-xs md:text-sm font-bold text-j-white hover:text-j-yellow-300 transition-colors duration-300 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                Voltar
            </button>

            {/* Card Principal de Login */}
            <div
                id="tour-login-card"
                className="
                    flex flex-col
                    relative
                    w-full items-center
                    p-1 bg-j-blue-800 rounded-2xl
                    shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                "
            >
                <Logo className="hidden md:block md:w-[100px] md:h-[100px] lg:w-[110px] lg:h-[110px] mb-2" />
                <div className="flex flex-col items-center md:contents">
                    <h1 className="text-2xl md:text-2xl font-extrabold text-j-white pt-4 md:pt-0 pb-2 text-center">LOGIN</h1>
                    <p className="text-xs md:text-sm text-j-transparent-white text-center px-5 pb-3">
                        Digite seu CPF e senha para acessar sua conta.
                    </p>

                    {/* Botão de Ajuda — reposicionado dentro do card, destacado com ícone e cor amarela */}
                    <button
                        type="button"
                        onClick={startTour}
                        title="Precisa de ajuda para acessar?"
                        className="flex items-center gap-1.5 mb-3 rounded-full bg-j-yellow-300/10 border border-j-yellow-300/40 px-3 py-1.5 text-[11px] font-semibold text-j-yellow-300 hover:bg-j-yellow-300/20 hover:border-j-yellow-300 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        <HelpCircle size={13} className="shrink-0" />
                        Como acessar pela primeira vez?
                    </button>
                </div>
                <div className="w-full flex flex-col items-center justify-between">
                    <div className="w-full flex flex-col items-center">
                        <FormLogin />
                        <p id="tour-login-join" className="text-[10px] md:text-xs text-j-transparent-white text-center">
                            Quer fazer parte do clube?{" "}
                            <button
                                type="button"
                                onClick={handleOpenJoinClub}
                                className="text-j-gray-200 pt-2 pb-4 underline hover:text-j-yellow-300 transition-colors duration-300 hover:cursor-pointer"
                            >
                                Conheça o caminho
                            </button>
                        </p>
                        <p className="text-j-white pt-3 pb-4 text-[8px] md:text-xs text-center">
                            &copy; 2026 JEEP CLUBE TAMOIOS • OFF-ROAD
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}