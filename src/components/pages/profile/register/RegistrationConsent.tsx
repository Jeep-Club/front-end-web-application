"use client";

import Link from "next/link";
import { useController, useFormContext } from "react-hook-form";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/common/button";
import type { RegisterSubmission } from "@/schemas/auth/register/registerRequest";

export default function RegistrationConsent({ isLoading }: { isLoading: boolean }) {
    const { control } = useFormContext<RegisterSubmission>();
    const { field: { name, ref, value, onChange, onBlur }, fieldState: { error } } = useController({
        name: "termsAccepted",
        control,
        defaultValue: false,
    });

    return (
        <div className="flex w-full flex-col gap-3 text-left">
            <div className="flex items-start gap-3">
                <input
                    id="register-terms-accepted"
                    type="checkbox"
                    name={name}
                    ref={ref}
                    checked={value}
                    onChange={(event) => onChange(event.target.checked)}
                    onBlur={onBlur}
                    disabled={isLoading}
                    required
                    aria-invalid={!!error}
                    aria-describedby={`register-terms-description${error ? " register-terms-error" : ""}`}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-j-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300"
                />
                <div className="text-sm leading-6 text-j-white">
                    <label htmlFor="register-terms-accepted" className="cursor-pointer">Li e aceito os Termos de Uso.</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <Link href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-j-yellow-300 px-3 py-2 text-xs font-semibold text-j-yellow-300 transition-colors hover:bg-j-yellow-300 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300">
                            Termos de Uso<span className="sr-only"> (abre em nova aba)</span>
                        </Link>
                        <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-j-yellow-300 px-3 py-2 text-xs font-semibold text-j-yellow-300 transition-colors hover:bg-j-yellow-300 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300">
                            Política de Privacidade<span className="sr-only"> (abre em nova aba)</span>
                        </Link>
                    </div>
                </div>
            </div>
            <p id="register-terms-description" className="text-xs leading-5 text-j-gray-200">O aceite é obrigatório para criar sua conta.</p>
            {error && <p id="register-terms-error" role="alert" className="text-sm text-j-red-100">{error.message}</p>}
            <Button type="submit" disabled={isLoading || !value} className="mt-1 w-full">
                {isLoading ? <>Registrando<LoaderCircle size={15} strokeWidth={3} className="animate-spin" /></> : <>Registrar<ArrowRight size={15} strokeWidth={3} /></>}
            </Button>
        </div>
    );
}
