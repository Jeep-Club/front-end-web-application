'use client';

import FormLogin from "./form";
import PainelLogin from "./painel";
import Link from "next/link";
import Image from "next/image";


export default function Login() {


    return (
        <div className={
            `
            z-10 flex flex-col relative items-center justify-between p-5 pt-20 bg-j-blue-800 
            w-full max-w-150 max-h-dvh 
            md:rounded-2xl rounded-t-2xl
            shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
            `
        }>
            <Image src="/images/logo_transparent.png" alt="Jeep Club Tamoios" width={170} height={170} className="absolute -top-20 Z-100"/> 
            <div className="flex flex-col w-full overflow-auto h-full gap-5 items-center justify-evenly">
                <div className="w-full md:flex flex-col items-center justify-center hidden">
                    <PainelLogin />
                </div>
                <div className="w-full flex flex-col items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-j-white md:mt-0 mt-5">LOGIN</h1>
                    <FormLogin />
                    <p className="text-sm text-j-transparent-white">Não faz parte do clube? <Link href={"/register"} className="text-j-gray-200 hover:text-j-yellow-300 transition-colors duration-300 hover:cursor-pointer">Junte-se a nós</Link></p>
                </div>
                <div className="w-full flex flex-col items-center justify-center h-full md:hidden">
                    <PainelLogin />
                </div>
            </div>
        </div>
    );
}