'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { ArrowRight, LoaderCircle } from "lucide-react";
import InputCPF from "@/components/common/input/input-cpf";

// IMPORTANTE: Lembre-se de criar essa Action e o Schema no seu projeto
import forgotPasswordAction from '@/actions/forgot-password';
import { forgotPasswordRequestSchema, ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";

export default function FormForgotPassword() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: forgotPasswordAction,
        onSuccess: () => {
            toast.success('Instruções enviadas com sucesso!');
            router.push("/login"); // Redireciona o usuário de volta
        },
        onError: (error) => toast.error(error.message || 'Erro ao solicitar nova senha. Verifique o CPF e tente novamente.')
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (data: ForgotPasswordRequestType) => {
        mutation.mutateAsync(data);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
                <p className="text-sm text-j-transparent-white">
                    Digite seu CPF para receber as instruções de recuperação.
                </p>
            </div>

            <Form<ForgotPasswordRequestType>
                schema={forgotPasswordRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
            >
                <InputCPF />

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4"
                >
                    {isLoading ? (
                        <>Enviando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></>
                    ) : (
                        <>Enviar<ArrowRight size={15} strokeWidth={3}/></>
                    )}
                </Button>

                {/* Botão para voltar ao login */}
                <button
                    type="button"
                    className="mt-2 text-sm text-j-transparent-white hover:text-j-yellow-300 transition-colors duration-300 w-full text-center"
                    onClick={() => router.push('/login')}
                >
                    Lembrei minha senha
                </button>
            </Form>
        </div>
    );
}