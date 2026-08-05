'use client';

import { useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { ArrowRight, LoaderCircle } from "lucide-react";
import InputCPF from "@/components/common/input/input-cpf";
import { useModal } from "@/providers/ModalProvider";
import { PasswordRecoveryModal } from "./PasswordRecoveryModal";

import forgotPasswordAction from '@/actions/auth/forgot-password';
import { forgotPasswordRequestSchema, ForgotPasswordRequestType } from "@/schemas/auth/forgot-password/forgotPasswordRequest";

export default function FormForgotPassword() {
    const { setContent, setOpen } = useModal();

    const mutation = useMutation({
        mutationFn: forgotPasswordAction,
        onSuccess: (_data, variables) => {
            setContent(<PasswordRecoveryModal cpf={variables.cpf} />);
            setOpen();
        },
        onError: (error) => toast.error(error.message || 'Erro ao solicitar nova senha. Verifique o CPF e tente novamente.')
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (data: ForgotPasswordRequestType) => {
        mutation.mutateAsync(data);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 px-5">
            <Form<ForgotPasswordRequestType>
                schema={forgotPasswordRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
            >
                <InputCPF required />

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>Enviando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></>
                    ) : (
                        <>Enviar<ArrowRight size={15} strokeWidth={3}/></>
                    )}
                </Button>
            </Form>
        </div>
    );
}