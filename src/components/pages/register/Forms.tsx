'use client';

import { useState } from 'react';
import {
    SubmitHandler,
    SubmitErrorHandler
} from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Form } from '@/components/common/form';
import { InputRegister } from '@/components/common/input/input-register';
import { Button } from '@/components/common/button_finalizar';
import { LgpdCheckbox } from './Lgpd';

import { registerAction } from '@/actions/registerAction';

import {
    registerFormSchema,
    RegisterFormData
} from '@/schemas/registerSchema';

import { maskCPF } from '@/utils/masks/maskCPF';
import { maskPhone } from '@/utils/masks/maskTel';

type FormValues = RegisterFormData & {
    lgpd: boolean;
};

export function RegisterForm() {
    const router = useRouter();

    const [serverError, setServerError] = useState<string | null>(null);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerError(null);

        try {
            const { lgpd, ...payload } = data;

            const result = await registerAction({
                ...payload,
                state: 'SP'
            });

            if (result?.success === false) {
                setServerError(result.error);
                return;
            }

            router.push('/login');
        } catch {
            setServerError(
                'Erro ao realizar cadastro. Tente novamente.'
            );
        }
    };

    const onError: SubmitErrorHandler<FormValues> = (errors) => {
        console.error('Erros de validação:', errors);
    };

    return (
        <div className="flex-1 min-w-0 flex items-start lg:items-center justify-center bg-black px-5 lg:px-10 py-8 overflow-y-auto">
            <div className="w-full max-w-lg">
                <h1 className="text-3xl lg:text-3xl font-black text-[var(--blue-100)] uppercase tracking-tight mb-1">
                    Novo Membro
                </h1>

                <p className="text-j-gray-300 text-[var(--fs-sm)] text-[var(--text-secundary)] mb-5">
                    Preencha os dados abaixo para iniciar sua jornada conosco.
                </p>

                <div className="w-full h-1.5 bg-[var(--gray-200)] rounded-full mb-7 overflow-hidden">
                    <div className="h-full w-1/2 bg-[var(--blue-300)] rounded-full transition-all duration-500" />
                </div>

                <Form<FormValues>
                    schema={registerFormSchema as any}
                    onSubmit={onSubmit}
                    onError={onError}
                    className="w-full flex flex-col gap-4"
                    formOptions={{
                        defaultValues: {
                            state: 'SP',
                            lgpd: false
                        }
                    }}
                >
                    <div className="w-full color-black">
                        <InputRegister
                            name="fullName"
                            label="Nome Completo"
                            type="text"
                            required
                        />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegister
                            name="nickname"
                            label="Apelido"
                            type="text"
                        />

                        <InputRegister
                            name="cpf"
                            label="CPF"
                            type="text"
                            placeholder="000.000.000-00"
                            required
                            mask={maskCPF}
                        />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegister
                            name="rg"
                            label="RG"
                            type="text"
                            required
                        />

                        <InputRegister
                            name="cnh"
                            label="CNH"
                            type="text"
                            placeholder="Número da CNH"
                        />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegister
                            name="birthDate"
                            label="Data de Nascimento"
                            type="date"
                            required
                        />

                        <InputRegister
                            name="memberSince"
                            label="Membro Desde"
                            type="date"
                        />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegister
                            name="phone"
                            label="Telefone"
                            type="tel"
                            placeholder="(00) 00000-0000"
                            required
                            mask={maskPhone}
                        />

                        <InputRegister
                            name="city"
                            label="Cidade"
                            type="text"
                            required
                        />
                    </div>

                    <div className="w-full">
                        <InputRegister
                            name="email"
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <InputRegister
                            name="password"
                            label="Senha"
                            type="password"
                            required
                        />

                        <div className=" text-j-gray-300 text-[15px] leading-relaxed pl-1">
                            <p>• Mínimo de 8 caracteres</p>
                            <p>• Pelo menos 1 letra maiúscula</p>
                            <p>• Pelo menos 1 letra minúscula</p>
                            <p>• Pelo menos 1 número</p>
                        </div>
                    </div>

                    <LgpdCheckbox
                        onChange={setLgpdAccepted}
                    />

                    {serverError && (
                        <p className=" text-[var(--fs-md)] text-[var(--danger)] bg-[var(--red-100)] rounded-lg px-3 py-2">
                            {serverError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={!lgpdAccepted}
                        className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finalizar Cadastro ›
                    </Button>

                    <p className="text-center text-[var(--fs-sm)] text-[var(--text-secundary)] mt-1 mb-4">
                        Já possui conta?{' '}

                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="text-[var(--blue-100)] font-semibold hover:underline"
                        >
                            Entrar
                        </button>
                    </p>
                </Form>
            </div>
        </div>
    );
}