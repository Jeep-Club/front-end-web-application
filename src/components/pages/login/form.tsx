'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import loginAction from '@/actions/auth/login';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { loginRequestSchema, LoginRequestType } from "@/schemas/auth/login/loginRequest";
import { ArrowRight, LoaderCircle } from "lucide-react";
import InputPassword from "@/components/common/input/input-password";
import InputCPF from "@/components/common/input/input-cpf";

export default function FormLogin() {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: loginAction, 
        onSuccess: () => {
            router.push("/feed");
            toast.success('Login realizado com sucesso!');
        }, 
        onError: (error) => toast.error(error.message || 'Erro ao realizar login. Verifique suas credenciais e tente novamente.') 
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
                onError={(errors) => console.log(errors)}
            >
                <div id="tour-login-cpf" className="w-full">
                    <InputCPF required />
                </div>

                <div className="w-full pb-5">
                    <div id="tour-login-password" className="relative w-full">
                        <InputPassword required />
                        <span 
                            id="tour-login-forgot"
                            className="text-xs md:text-sm text-j-transparent-white absolute top-full right-0 mt-1 hover:text-j-yellow-300 hover:underline hover:cursor-pointer transition-colors duration-300"
                            onClick={() => router.push('/forgot-password')}
                        >
                            Esqueceu a senha?
                        </span>
                    </div>
                </div>

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
