'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { ShieldCheck, Mail, X, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import forgotPasswordEmailTokenAction from "@/actions/auth/forgot-password-email-token";

const AUTO_CLOSE_SECONDS = 30;

interface PasswordRecoveryModalProps {
    cpf: string;
}

export function PasswordRecoveryModal({ cpf }: PasswordRecoveryModalProps) {
    const router = useRouter();
    const { setClose } = useModal();
    const [secondsLeft, setSecondsLeft] = useState(AUTO_CLOSE_SECONDS);

    const emailMutation = useMutation({
        mutationFn: () => forgotPasswordEmailTokenAction({ cpf }),
        onSuccess: () => {
            toast.success('E-mail enviado! Confira sua caixa de entrada.');
            setTimeout(() => {
                setClose();
                router.push('/login');
            }, 1000);
        },
        onError: (error) => toast.error(error.message || 'Erro ao enviar o e-mail de redefinição.'),
    });

    useEffect(() => {
        if (secondsLeft <= 0) {
            setClose();
            return;
        }
        const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft, setClose]);

    return (
        <div
            className={`
                relative w-full
                flex flex-col gap-4 md:gap-6
                p-4 md:p-8 max-h-[90dvh] overflow-y-auto overflow-x-hidden
                bg-j-blue-800 rounded-2xl
                shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)]
                text-j-white
            `}
        >
            <ButtonIcon
                onClick={setClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-j-transparent-white hover:text-j-yellow-300"
            >
                <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </ButtonIcon>

            <div className="flex flex-col items-center text-center gap-2 md:gap-3 pr-6 md:pr-4">
                <span className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-j-blue-700 text-j-yellow-300">
                    <ShieldCheck className="w-5 h-5 md:w-7 md:h-7" />
                </span>
                <h2 className="text-base md:text-2xl font-extrabold text-j-white">Solicitação enviada!</h2>
                <p className="text-xs md:text-sm text-j-transparent-white">
                    Sua solicitação de troca de senha chegou até a diretoria do Jeep Clube Tamoios. Em breve, um administrador vai te enviar uma nova senha ou te ajudar a criar uma, fique de olho no seu contato cadastrado.
                </p>
            </div>

            <div className="flex flex-col gap-3 p-3 md:p-4 rounded-lg border-2 border-j-yellow-300 bg-j-blue-900/60">
                <div className="flex gap-3 items-start">
                    <span className="shrink-0 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-j-yellow-300 text-j-blue-800">
                        <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    <div className="flex flex-col">
                        <p className="font-bold text-j-white text-xs md:text-sm">Não quer esperar? Resolva agora mesmo</p>
                        <p className="text-xs md:text-sm text-j-transparent-white">
                            Se preferir, enviamos um e-mail com um link seguro para você mesmo criar uma nova senha, sem depender da diretoria.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => emailMutation.mutate()}
                    disabled={emailMutation.isPending || emailMutation.isSuccess}
                    className={twMerge(
                        "w-full",
                        emailMutation.isSuccess && "bg-j-green-400 disabled:bg-j-green-400 text-j-white disabled:text-j-white"
                    )}
                >
                    {emailMutation.isPending ? (
                        <>Enviando e-mail<LoaderCircle size={15} strokeWidth={3} className="animate-spin" /></>
                    ) : emailMutation.isSuccess ? (
                        <>E-mail enviado<CheckCircle2 size={15} strokeWidth={3} /></>
                    ) : (
                        <>Enviar e-mail de redefinição<Mail size={15} strokeWidth={3} /></>
                    )}
                </Button>
            </div>

            <p className="text-xs text-j-transparent-white text-center">
                Esta janela fecha automaticamente em {secondsLeft}s
            </p>
        </div>
    );
}

export default PasswordRecoveryModal;
