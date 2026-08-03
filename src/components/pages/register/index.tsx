'use client';

import FormRegister from "./form";
import Link from "next/link";
import { Logo } from "@/components/common/logo";

export default function Register() {
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
                <div className="w-full flex flex-col items-center justify-between md:h-full">
                    <h1 className="text-3xl font-extrabold text-j-white md:mt-0 mt-5">CRIAR CONTA</h1>
                    <FormRegister />
                    <p className="text-sm text-j-transparent-white mt-4">
                        Já faz parte do clube? <Link href={"/login"} className="text-j-gray-200 hover:text-j-yellow-300 transition-colors duration-300 hover:cursor-pointer">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}