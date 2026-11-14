'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import FormForgotPassword from "./form";
import { Logo } from "@/components/common/logo";
import { getForgotPasswordTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";


export default function ForgotPassword() {
    const router = useRouter();
    const { startTour } = usePageTour({
        storageKey: "tour_completed_member_password_recovery",
        steps: getForgotPasswordTourSteps,
        autoStartOnFirstVisit: false,
    });

    return (
        <div className={
            `
            z-10 flex flex-col relative items-center
            w-full max-w-150
`
        }>
            <button
                type="button"
                onClick={() => router.back()}
                className="fixed top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1 text-xs md:text-sm font-bold text-j-white hover:text-j-yellow-300 transition-colors duration-300 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                Voltar
            </button>
            <div
                id="tour-forgot-card"
                className={
                    `
                    flex flex-col
                    relative
                    w-full items-center
                    p-1 bg-j-blue-800 rounded-2xl
                    shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                    `
                }
            >
                <Logo sizes="(min-width: 1024px) 110px, (min-width: 768px) 100px, 0px" className="hidden md:block md:w-[100px] md:h-[100px] lg:w-[110px] lg:h-[110px] mb-2" />
                <div className="flex flex-col items-center md:contents">
                    <h1 className="text-xl md:text-2xl font-extrabold text-j-white pt-4 md:pt-0 pb-2 text-center">RECUPERAR SENHA</h1>
                    <p className="text-xs md:text-sm text-j-transparent-white text-center px-5 pb-2">
                        Digite seu CPF para receber as instruções de recuperação.
                    </p>
                    <button
                        type="button"
                        onClick={startTour}
                        title="Precisa de ajuda para recuperar sua senha?"
                        className="mb-3 flex cursor-pointer items-center gap-1.5 rounded-full border border-j-yellow-300/40 bg-j-yellow-300/10 px-3 py-1.5 text-[11px] font-semibold text-j-yellow-300 transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-200 hover:border-j-yellow-300 hover:bg-j-yellow-300/20 active:scale-95"
                    >
                        <HelpCircle size={13} className="shrink-0" />
                        Como recuperar minha senha?
                    </button>
                </div>
                <div className="w-full flex flex-col items-center justify-between">
                    <div className="w-full flex flex-col items-center">
                        <FormForgotPassword />
                        <p id="tour-forgot-back" className="text-[10px] md:text-xs text-j-transparent-white text-center">
                            Lembrou a senha? <button type="button" onClick={() => router.push('/login')} className="text-j-gray-200 pt-2 pb-4 underline hover:text-j-yellow-300 transition-colors duration-300 hover:cursor-pointer">Voltar para o login</button>
                        </p>
                        <p className="text-j-white pt-3 pb-4 text-[8px] md:text-xs text-center">&copy; 2026 JEEP CLUBE TAMOIOS • OFF-ROAD</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
