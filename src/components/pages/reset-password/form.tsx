'use client';

import { Button } from "@/components/common/button";
import { Form } from "@/components/common/form";
import InputPassword from "@/components/common/input/input-password";
import { useMutation } from '@tanstack/react-query';
import { ArrowRight,LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { resetPasswordRequestSchema,ResetPasswordRequestType } from "@/schemas/auth/reset-password/resetPasswordRequest";
import resetPasswordAction from '@/server/actions/auth/reset-password';

interface FormResetPasswordProps {
    token: string;
}

export default function FormResetPassword({ token }: FormResetPasswordProps) {
    const router = useRouter();

    const mutation = useMutation({
        // Passamos o token junto com os dados do formulário para a Action
        mutationFn: (data: ResetPasswordRequestType) => resetPasswordAction({ ...data, token }),
        onSuccess: () => {
            toast.success('Senha alterada com sucesso!');
            router.push("/login");
        }
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (data: ResetPasswordRequestType) => {
        mutation.mutateAsync(data);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Senha</h2>
                <p className="text-sm text-j-transparent-white">
                    Digite e confirme a sua nova senha.
                </p>
            </div>

            <Form<ResetPasswordRequestType>
                schema={resetPasswordRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
            >
                <div className="w-full flex flex-col gap-4">

                    <InputPassword name="password" placeholder="Nova Senha" labelClassName="text-j-white" errorClassName="text-j-red-100" />
                    <InputPassword name="confirmPassword" placeholder="Confirme a Senha" labelClassName="text-j-white" errorClassName="text-j-red-100" />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full mt-4"
                >
                    {isLoading ? (
                        <>Salvando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></>
                    ) : (
                        <>Salvar Nova Senha<ArrowRight size={15} strokeWidth={3}/></>
                    )}
                </Button>
            </Form>
        </div>
    );
}
