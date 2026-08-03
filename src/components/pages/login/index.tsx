'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormLogin from "./form";
import { Logo } from "@/components/common/logo";
import { useModal } from "@/providers/ModalProvider";
import { JoinClubModal } from "./JoinClubModal";


export default function Login() {
    const router = useRouter();
    const { setContent, setOpen } = useModal();

    const handleOpenJoinClub = () => {
        setContent(<JoinClubModal />);
        setOpen();
    };

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
                <Logo className="hidden md:block md:w-[100px] md:h-[100px] lg:w-[110px] lg:h-[110px] mb-2" />
                <div className="flex flex-col items-center md:contents">
                    <h1 className="text-2xl md:text-2xl font-extrabold text-j-white pt-4 md:pt-0 pb-2 text-center">LOGIN</h1>
                    <p className="text-xs md:text-sm text-j-transparent-white text-center px-5 pb-2">
                        Digite seu CPF e senha para acessar sua conta.
                    </p>
                </div>
                <div className="w-full flex flex-col items-center justify-between">
                    <div className="w-full flex flex-col items-center">
                        <FormLogin />
                        <p className="text-[10px]  md:text-xs text-j-transparent-white text-center">Quer fazer parte do clube? <button type="button" onClick={handleOpenJoinClub} className="text-j-gray-200 pt-2 pb-4 underline hover:text-j-yellow-300 transition-colors duration-300 hover:cursor-pointer">Conheça o caminho</button></p>
                        <p className="text-j-white pt-3 pb-4 text-[8px] md:text-xs text-center">&copy; 2026 JEEP CLUBE TAMOIOS • OFF-ROAD</p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}