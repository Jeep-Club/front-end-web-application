'use client';

import { useRouter } from "next/navigation";
import { useMutation } from '@tanstack/react-query';
import toast from "react-hot-toast";
import { ArrowRight, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { UserWorkspace } from "../UserWorkspace";

import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { InputRegister } from "@/components/common/input/input-register";
import InputEmail from "@/components/common/input/input-email";
import InputCPF from "@/components/common/input/input-cpf";
import InputDate from "@/components/common/input/input-date";
import InputPassword from "@/components/common/input/input-password";
import InputPhoneNumber from "@/components/common/input/input-phonenumber";
import { registerRequestSchema } from "@/schemas/auth/register/registerRequest";
import { postUserAction } from "@/actions/admin/users/postUser";

const fieldStyle = {
    labelClassName: "text-j-gray-600 [&>span]:text-j-red-500",
    className: "min-w-0 h-12 border rounded-xl border-j-gray-300 bg-j-white font-normal text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:outline-j-yellow-400 aria-[invalid=true]:border-j-red-500",
};

export function NewAdminUserPage() {
    const router = useRouter();
    const [selected, setSelected] = useState("personal");
    const mutation = useMutation({
        mutationFn: postUserAction,
        onSuccess: () => {
            router.push("/admin/users");
            toast.success('Usuário cadastrado com sucesso!');
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
        },
    });

    const isLoading = mutation.isPending;
    const handleSubmit = (data: RegisterRequest) => {
        if (!isLoading) mutation.mutate({ user: data });
    };

    return (
        <UserWorkspace
            title="Novo usuário"
            description="Preencha os dados para criar a conta."
            options={[
                { key: "personal", label: "Dados pessoais", description: "Identificação e contato", icon: UserRound },
                { key: "access", label: "Acesso", description: "Defina a senha de acesso", icon: LockKeyhole },
            ]}
            selected={selected}
            onSelect={setSelected}
            onBack={() => router.push("/admin/users")}
            disabled={isLoading}
        >
                <Form<RegisterRequest>
                    schema={registerRequestSchema}
                    onSubmit={handleSubmit}
                    formOptions={{ shouldFocusError: false }}
                    onError={(errors) => {
                        const firstField = Object.keys(errors)[0];
                        setSelected(firstField === "password" ? "access" : "personal");
                        requestAnimationFrame(() => {
                            document.getElementsByName(firstField)[0]?.focus();
                        });
                        toast.error("Confira os campos destacados antes de continuar.");
                    }}
                    className="items-stretch gap-0"
                >
                    <fieldset disabled={isLoading} className="flex min-w-0 flex-col gap-4 p-4 sm:p-6 [&_input+svg]:text-j-gray-400 [&_input~button]:text-j-gray-400">
                        <p className="text-sm text-j-gray-500"><span className="font-bold text-j-red-500">*</span> Campos obrigatórios</p>

                        <section hidden={selected !== "personal"} aria-labelledby="personal-data-title">
                            <h2 id="personal-data-title" className="sr-only">Dados pessoais</h2>
                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                                <div className="min-w-0 sm:col-span-2">
                                    <InputRegister {...fieldStyle} name="name" label="Nome completo" placeholder="Digite o nome completo" autoComplete="name" required />
                                </div>
                                <InputCPF {...fieldStyle} name="cpf" label="CPF" autoComplete="off" required />
                                <InputDate {...fieldStyle} name="birthData" label="Data de nascimento" autoComplete="bday" required />
                                <InputEmail {...fieldStyle} name="email" label="E-mail" placeholder="nome@exemplo.com" autoComplete="email" required />
                                <InputPhoneNumber {...fieldStyle} name="phoneNumber" label="Telefone" placeholder="(00) 00000-0000" autoComplete="tel-national" required />
                            </div>
                        </section>

                        <section hidden={selected !== "access"} aria-labelledby="access-data-title">
                            <h2 id="access-data-title" className="sr-only">Dados de acesso</h2>
                            <div className="grid grid-cols-1 gap-3">
                                <InputPassword {...fieldStyle} name="password" label="Senha" aria-describedby="password-guidance" required />
                                <p id="password-guidance" className="text-xs leading-5 text-j-gray-500">Use pelo menos 8 caracteres, incluindo letras maiúsculas e minúsculas, um número e um caractere especial.</p>
                            </div>
                        </section>
                    </fieldset>

                    <footer className="flex items-center gap-3 border-t border-j-gray-200 px-4 py-4 sm:justify-end sm:px-6">
                        <Button
                            disabled={isLoading}
                            onClick={() => router.push("/admin/users")}
                            className="min-h-12 rounded-xl bg-transparent px-3 text-j-gray-500 hover:bg-j-gray-100 hover:text-j-gray-700"
                        >Cancelar</Button>
                        <Button type="submit" disabled={isLoading} aria-busy={isLoading} className={selected === "access" ? "min-h-12 flex-1 gap-2 rounded-xl px-4 sm:flex-none sm:px-6" : "hidden"}>
                            {isLoading ? <>Cadastrando… <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /></> : <>Cadastrar usuário <ArrowRight size={18} aria-hidden="true" /></>}
                        </Button>
                        {selected === "personal" && (
                            <Button type="button" disabled={isLoading} onClick={() => setSelected("access")} className="min-h-12 flex-1 gap-2 rounded-xl px-4 sm:flex-none sm:px-6">
                                Continuar <ArrowRight size={18} aria-hidden="true" />
                            </Button>
                        )}
                    </footer>
                </Form>
        </UserWorkspace>
    );
}
