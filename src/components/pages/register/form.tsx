'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import {registerAction} from '@/actions/registerAction';
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { registerRequestSchema } from "@/schemas/auth/register/registerRequest";
import { ArrowRight, LoaderCircle } from "lucide-react";
import InputPassword from "@/components/common/input/input-password";
import InputCPF from "@/components/common/input/input-cpf";
import {InputRegister} from "@/components/common/input/input-register";

export default function FormRegister() {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: registerAction, 
        onSuccess: (data) => {
            console.log(data);
            router.push("/home"); 
            toast.success('Registro realizado com sucesso!');
        }, 
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (registerRequest: RegisterRequest) => {
        mutation.mutateAsync(registerRequest);
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <Form<RegisterRequest>
                schema={registerRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
            >
                <InputRegister name="name" label="Nome Completo" placeholder="Digite seu nome" type="text" />
                <InputRegister name="email" label="Email" placeholder="Digite seu email" type="email" />
                <InputRegister name="birthData" label="Data de Nascimento" type="text" />
                <InputCPF />
                <InputRegister name="rg" label="RG" placeholder="Digite seu RG" type="text" />
                <InputRegister name="phoneNumber" label="Telefone" placeholder="Digite seu telefone" type="tel" />
                <InputPassword name="password"/>
                
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-4"
                >
                    {isLoading ? <>Registrando<LoaderCircle size={15} strokeWidth={3} className="animate-spin"/></> : <>Registrar<ArrowRight size={15} strokeWidth={3}/></>}
                </Button>
            </Form>
        </div>
    );
}
