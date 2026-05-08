'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, SubmitErrorHandler, useFormContext } from 'react-hook-form';
import { Form } from '@/components/common/form';
import { Input } from '@/components/common/input';
import { registerAction } from '@/actions/registerAction';
import { registerFormSchema, RegisterFormData } from '@/schemas/registerSchema';
import { Logo } from '@/components/common/logo';
import { useController } from 'react-hook-form';

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

// ── Checkbox LGPD isolado para usar useFormContext dentro do Form ──
function LgpdCheckbox() {
    const { control, formState: { errors } } = useFormContext<FormValues>();
    const { field } = useController({
        name: 'lgpd',
        control,
        defaultValue: false,
        rules: { required: 'Você precisa aceitar os termos da LGPD.' },
    });

    return (
        <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-start gap-3">
                <input
                    id="lgpd"
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[var(--blue-300)] cursor-pointer"
                />
                <label htmlFor="lgpd" className="text-[var(--fs-xs)] text-[var(--text-secundary)] leading-relaxed cursor-pointer">
                    Declaro que autorizo a coleta e armazenamento dos meus dados conforme as diretrizes da{' '}
                    <a
                        href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--blue-300)] underline hover:text-[var(--blue-200)]"
                    >
                        LGPD
                    </a>
                    .
                </label>
            </div>
            {errors.lgpd && (
                <p className="text-[var(--fs-xs)] text-[var(--danger)]">
                    {errors.lgpd.message}
                </p>
            )}
        </div>
    );
}

export default function Step1Form() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setServerError(null);
        try {
            const { lgpd, ...payload } = data;
            const result = await registerAction({
                ...payload,
                state: 'SP',
            });
            if (result?.success === false) {
                setServerError(result.error);
            }
        } catch {
            setServerError('Erro ao realizar cadastro. Tente novamente.');
        }
    };

    const onError: SubmitErrorHandler<FormValues> = (errors) => {
        console.error('Erros de validação:', errors);
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">

            {/* ── Header mobile ── */}
            <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-[var(--blue-300)]">
                <Logo />
                <div className="text-right">
                    <p className="text-[10px] tracking-[0.15em] text-[var(--yellow-100)] uppercase">Desde 09/09/1999</p>
                    <p className="text-sm font-black text-[var(--white)] uppercase">Jeep Club Tamoios</p>
                </div>
            </div>

            {/* ── Lado esquerdo — imagem (desktop) ── */}
            <div className="hidden lg:flex w-[45%] relative flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-jeep.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                <div className="relative z-10 p-8">
                    <Logo className="w-16 h-16" />
                </div>

                <div className="relative z-10 p-8 pb-10">
                    <p className="text-xs tracking-[0.2em] text-[var(--yellow-100)] uppercase mb-1">Desde 09/09/1999</p>
                    <h2 className="text-4xl font-black text-[var(--white)] uppercase leading-tight">
                        Jeep Club<br />Tamoios
                    </h2>
                    <p className="text-sm text-[var(--transparent-white)] mt-2">Jeep Club Tamoios Caraguatatuba</p>
                </div>
            </div>

            {/* ── Lado direito — formulário ── */}
            <div className="flex-1 flex items-start lg:items-center justify-center bg-[var(--background)] px-5 lg:px-10 py-8 overflow-y-auto">
                <div className="w-full max-w-lg">

                    <h1 className="text-2xl lg:text-3xl font-black text-[var(--blue-300)] uppercase tracking-tight mb-1">
                        Novo Membro
                    </h1>
                    <p className="text-[var(--fs-sm)] text-[var(--text-secundary)] mb-5">
                        Preencha os dados abaixo para iniciar sua jornada conosco.
                    </p>

                    {/* Barra de progresso */}
                    <div className="w-full h-1.5 bg-[var(--gray-200)] rounded-full mb-7 overflow-hidden">
                        <div className="h-full w-1/2 bg-[var(--blue-300)] rounded-full transition-all duration-500" />
                    </div>

                    <Form<FormValues>
                        schema={registerFormSchema as any}
                        onSubmit={onSubmit}
                        onError={onError}
                        className="flex flex-col gap-4"
                        formOptions={{
                            defaultValues: { state: 'SP' }
                        }}
                    >
                        <Input name="fullName" label="Nome Completo" type="text" required />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="nickname" label="Apelido" type="text" />
                            <Input name="cpf" label="CPF" type="text" placeholder="000.000.000-00" required onChange={maskCPF} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="rg" label="RG" type="text" required />
                            <Input name="cnh" label="CNH" type="text" placeholder="Número da CNH" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="birthDate" label="Data de Nascimento" type="date" required />
                            <Input name="memberSince" label="Membro Desde" type="date" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="phone" label="Telefone" type="tel" placeholder="(00) 00000-0000" required onChange={maskPhone} />
                            <Input name="city" label="Cidade" type="text" required />
                        </div>

                        <Input name="email" label="E-mail" type="email" placeholder="seu@email.com" />

                        <Input name="password" label="Senha" type="password" required />

                        {/* LGPD — checkbox manual */}
                        <LgpdCheckbox />

                        {/* Erro do servidor */}
                        {serverError && (
                            <p className="text-[var(--fs-xs)] text-[var(--danger)] bg-[var(--red-100)]/10 border border-[var(--danger)] rounded-[var(--r-md)] px-3 py-2">
                                {serverError}
                            </p>
                        )}

                        {/* Botão submit */}
                        <button
                            type="submit"
                            className="w-full bg-[var(--button-active)] hover:bg-[var(--button-hover)]
                                text-[var(--button-text)] font-bold text-[var(--fs-sm)] uppercase tracking-widest py-4 rounded-[var(--r-md)]
                                transition-colors duration-200 mt-1 flex items-center justify-center gap-2"
                        >
                            Finalizar Cadastro ›
                        </button>

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
        </div>
    );
}