'use client';

import { useRouter } from "next/navigation";
import FormForgotPassword from "./form";
import PainelLogin from "@/components/pages/login/painel";
import { Logo } from "@/components/common/logo";


export default function ForgotPassword() {
    const router = useRouter();

    return (
        <div className={
            `
            z-10 flex flex-col relative items-center justify-between
            w-full max-w-150 h-full
            `
        }>
            <Logo
                className="w-40 h-40 md:w-40 md:h-40 z-10 relative top-16"
            />
            <div
                className={
                    `
                    flex md:flex-col flex-col-reverse
                    relative
                    w-full gap-10 items-center justify-between
                    p-5 pt-20 pb-20 bg-j-blue-800 md:rounded-2xl rounded-t-2xl
                    shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                    `
                }
            >
                <div className="w-full flex flex-col items-center justify-center">
                    <PainelLogin />
                </div>
                <div className="w-full flex flex-col items-center justify-between md:h-full">
                    <div className="text-center md:mt-0 mt-5">
                        <h1 className="text-3xl font-extrabold text-j-white">RECUPERAR SENHA</h1>
                        <p className="text-sm text-j-transparent-white mt-2">
                            Digite seu CPF para receber as instruções de recuperação.
                        </p>
                    </div>
                    <FormForgotPassword />
                    <p className="text-sm text-j-transparent-white">
                        Lembrou a senha?{" "}
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-j-gray-200 hover:text-j-yellow-300 hover:underline transition-colors duration-300 hover:cursor-pointer"
                        >
                            Voltar para o login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
