'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import loginAction from '@/actions/login';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { loginRequestSchema, LoginRequestType } from "@/schemas/auth/login/loginRequest";
import { ArrowRight, LoaderCircle } from "lucide-react";

export default function FormLogin() {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: loginAction, 
        onSuccess: () => {router.push("/home"); toast.success('Login realizado com sucesso!');}, 
        onError: (error) => toast.error(error.message || 'Erro ao realizar login. Verifique suas credenciais e tente novamente.') 
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (loginRequest: LoginRequestType) => {
        // if(!loginRequest.cpf || !loginRequest.password) {
        //     toast.error('Por favor, preencha todos os campos.');
        //     return;
        // }

        mutation.mutateAsync(loginRequest);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <Form
                schema={loginRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors)=>console.log(errors)}
            >
                <Input type="text" label="CPF" name="cpf" placeholder="000.000.000-00" />
                <div className="relative w-full">
                    <Input type="password" label="Senha" name="password" placeholder="*********" />
                    <span className="text-sm text-j-transparent-white absolute top-0 right-0  hover:text-j-yellow-300 hover:cursor-pointer transition-colors duration-300"
                        onClick={() => router.push('/forgot-password')}
                    >Esqueceu a senha?</span>
                </div>
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? <>Entrando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></> : <>Entrar<ArrowRight size={15} strokeWidth={3}/></>}
                </Button>
            </Form>
                    </div>
    );
}