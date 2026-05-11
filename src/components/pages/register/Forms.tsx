'use client';

import { useState } from 'react';
import { SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Form } from '@/components/common/form';
import { InputRegistro } from '@/components/common/input/input-solo-register';
import { Button } from '@/components/common/button_finalizar';
import { LgpdCheckbox } from './Lgpd';

import { registerAction } from '@/actions/registerAction';
import { registerFormSchema, RegisterFormData } from '@/schemas/registerSchema';

function maskCPF(value: string) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

type FormValues = RegisterFormData & { lgpd: boolean };

export function RegisterForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [lgpdAccepted, setLgpdAccepted] = useState(false);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerError(null);
        try {
            const { lgpd, ...payload } = data;
            const result = await registerAction({ ...payload, state: 'SP' });
            if (result?.success === false) setServerError(result.error);
        } catch {
            setServerError('Erro ao realizar cadastro. Tente novamente.');
        }
    };

    const onError: SubmitErrorHandler<FormValues> = (errors) => {
        console.error('Erros de validação:', errors);
    };

    return (
        <div className="flex-1 min-w-0 flex items-start lg:items-center justify-center bg-[var(--background)] px-5 lg:px-10 py-8 overflow-y-auto">
            <div className="w-full max-w-lg">

                <h1 className="text-2xl lg:text-3xl font-black text-[var(--blue-300)] uppercase tracking-tight mb-1">
                    Novo Membro
                </h1>
                <p className="text-[var(--fs-sm)] text-[var(--text-secundary)] mb-5">
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
                    formOptions={{ defaultValues: { state: 'SP' } }}
                >
                    <div className="w-full">
                        <InputRegistro name="fullName" label="Nome Completo" type="text" required />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegistro name="nickname" label="Apelido" type="text" />
                        <InputRegistro name="cpf" label="CPF" type="text" placeholder="000.000.000-00" required mask={maskCPF} />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegistro name="rg" label="RG" type="text" required />
                        <InputRegistro name="cnh" label="CNH" type="text" placeholder="Número da CNH" />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegistro name="birthDate" label="Data de Nascimento" type="date" required />
                        <InputRegistro name="memberSince" label="Membro Desde" type="date" />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4">
                        <InputRegistro name="phone" label="Telefone" type="tel" placeholder="(00) 00000-0000" required mask={maskPhone} />
                        <InputRegistro name="city" label="Cidade" type="text" required />
                    </div>

                    <div className="w-full">
                        <InputRegistro name="email" label="E-mail" type="email" placeholder="seu@email.com" />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <InputRegistro name="password" label="Senha" type="password" required />
                        <div className="text-[15px] text-[var(--text-secundary)] leading-relaxed pl-1">
                            <p>• Mínimo de 8 caracteres</p>
                            <p>• Pelo menos 1 letra maiúscula</p>
                            <p>• Pelo menos 1 letra minúscula</p>
                            <p>• Pelo menos 1 número</p>
                        </div>
                    </div>

                    <LgpdCheckbox onChange={setLgpdAccepted} />

                    {serverError && (
                        <p className="text-[var(--fs-xs)] text-[var(--danger)] bg-[var(--red-100)]/10 border border-[var(--danger)] rounded-lg px-3 py-2">
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
                            className="text-[var(--blue-300)] font-semibold hover:underline"
                        >
                            Entrar
                        </button>
                    </p>
                </Form>
            </div>
        </div>
    );
}