'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { ArrowRight, LoaderCircle } from "lucide-react";

// Ajuste os caminhos de importação conforme o seu projeto

// Componentes Base
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";

// Inputs Disponíveis
import { Input } from "@/components/common/input";
import InputEmail from "@/components/common/input/input-email";
import InputCPF from "@/components/common/input/input-cpf";
import InputDate from "@/components/common/input/input-date";
import InputPassword from "@/components/common/input/input-password";
import InputPhoneNumber from "@/components/common/input/input-phonenumber";
import { registerRequestSchema } from "@/schemas/auth/register/registerRequest";
import { postUserAction } from "@/actions/admin/users/postUser";

interface Props {}

export function NewAdminUserPage({}: Props) {
    const router = useRouter();

    const mutation = useMutation({ 
        mutationFn: postUserAction, 
        onSuccess: () => {
            // Ajuste a rota para onde o admin deve ser redirecionado após o sucesso
            router.push("/admin/users"); 
            toast.success('Usuário cadastrado com sucesso!');
        }, 
        onError: (error) => {
            toast.error(error.message || 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
        } 
    });

    const isLoading = mutation.isPending;

    const handleSubmit = (data: RegisterRequest) => {
        mutation.mutate({user: data});
    };

    return (
        <div className="my-auto w-full flex flex-col items-center justify-center gap-5 px-5 py-8 max-w-2xl mx-auto bg-j-blue-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold self-start w-full mb-4 text-j-white">Novo Usuário Administrador</h1>
            
            <Form<RegisterRequest>
                schema={registerRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.log("Erros no form:", errors)}
            >
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                    {/* Linha 1 */}
                    <div className="col-span-1 md:col-span-2">
                        <Input name="name" label="Nome Completo" placeholder="Lucas Alves" required />
                    </div>

                    {/* Linha 2 */}
                    <InputDate name="birthData" label="Data de Nascimento" required />
                    <InputEmail name="email" label="E-mail" placeholder="lucas.alves@email.com" required />

                    {/* Linha 3 */}
                    <InputCPF name="cpf" label="CPF" placeholder="000.000.000-00" required />
                    <Input name="rg" label="RG" placeholder="12.345.678-9" required />

                    {/* Linha 4 */}
                    <InputPhoneNumber name="phoneNumber" label="Telefone" placeholder="+55 (00) 00000-0000" required />
                    <InputPassword name="password" label="Senha" required />
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full md:w-auto self-end md:px-10"
                >
                    {isLoading ? (
                        <>Cadastrando <LoaderCircle size={15} strokeWidth={3} className="animate-spin ml-2"/></>
                    ) : (
                        <>Cadastrar <ArrowRight size={15} strokeWidth={3} className="ml-2"/></>
                    )}
                </Button>
            </Form>
        </div>
    );
}