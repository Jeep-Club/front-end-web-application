'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import loginAction from '@/actions/auth/login';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { loginRequestSchema, LoginRequestType } from "@/schemas/auth/login/loginRequest";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import InputPassword from "@/components/common/input/input-password";
import InputCPF from "@/components/common/input/input-cpf";

export default function FormLogin() {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: loginAction, 
        onSuccess: (result) => {
            if ("passwordChangeToken" in result || result.status === "PASSWORD_CHANGE_REQUIRED" || result.status === "FIRST_ACCESS_PASSWORD_CHANGE_REQUIRED") {
                router.push("/first-access/password");
                return;
            }
            router.push("/feed");
            toast.success('Login realizado com sucesso!');
        }, 
        onError: (error) => toast.error(error.message || 'CPF ou senha inválidos. Confira os dados e tente novamente.'),
    });

    const isLoading = mutation.isPending;

    const handleSubmit = (loginRequest: LoginRequestType) => {
        mutation.mutate(loginRequest);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 px-5">
            <Form<LoginRequestType>
                schema={loginRequestSchema}
                onSubmit={handleSubmit}
                onError={() => toast.error('Confira o CPF e a senha informados.')}
            >
                <div id="tour-login-cpf" className="w-full">
                    <InputCPF required labelClassName="text-j-white" errorClassName="text-j-red-100" />
                </div>

                <div className="w-full pb-5">
                    <div id="tour-login-password" className="relative w-full">
                        <InputPassword required autoComplete="current-password" labelClassName="text-j-white" errorClassName="text-j-red-100" />
                        <span 
                            id="tour-login-forgot"
                            className="text-xs md:text-sm text-j-transparent-white absolute top-full right-0 mt-1 hover:text-j-yellow-300 hover:underline hover:cursor-pointer transition-colors duration-300"
                            onClick={() => router.push('/forgot-password')}
                        >
                            Esqueceu a senha?
                        </span>
                    </div>
                </div>

                {mutation.isError && (
                    <div role="alert" className="flex w-full items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium leading-5 text-red-800 shadow-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
                        <span>{mutation.error instanceof Error ? mutation.error.message : 'CPF ou senha inválidos. Confira os dados e tente novamente.'}</span>
                    </div>
                )}

                <Button 
                    id="tour-login-submit"
                    type="submit" 
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            Entrando
                            <LoaderCircle size={15} strokeWidth={3} className="animate-spin" />
                        </>
                    ) : (
                        <>
                            Entrar
                            <ArrowRight size={15} strokeWidth={3} />
                        </>
                    )}
                </Button>
            </Form>
        </div>
    );
}
