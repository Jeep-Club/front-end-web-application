'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import FormLogin from "./form";
import ClubFormHeader from "@/components/common/ClubFormHeader";
import { usePageTour } from "@/hooks/useTour";
import { getLoginTourSteps } from "@/config/tourSteps";

export default function Login() {
    const router = useRouter();

    // Tour sob demanda para a tela de login (não auto-inicia, adaptado para mobile e desktop)
    const { startTour } = usePageTour({
        steps: getLoginTourSteps,
        autoStartOnFirstVisit: false,
    });

    return (
        <div className="z-10 relative flex w-full max-w-2xl flex-col items-center">
            {/* Botão Voltar */}
            <button
                type="button"
                onClick={() => router.push('/')}
                className="mb-5 inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-black/30 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
            >
                <ArrowLeft size={17} aria-hidden="true" />
                Voltar para a página inicial
            </button>

            {/* Card Principal de Login */}
            <div
                id="tour-login-card"
                className="
                    flex flex-col
                    relative
                    w-full items-center
                    pb-4 bg-j-blue-800 rounded-2xl
                    shadow-2xl shadow-black/40
                "
            >
                <ClubFormHeader title="Entrar" description="Digite seu CPF e senha para acessar sua conta." />
                <div className="flex flex-col items-center md:contents">

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
                        <p id="tour-login-join" className="px-5 pt-3 pb-2 text-center text-[10px] text-j-transparent-white md:text-xs">
                            Não é sócio?{" "}
                            <Link
                                href="/membership/apply"
                                className="text-j-gray-200 underline transition-colors duration-300 hover:text-j-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
                            >
                                Quero ser sócio
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
