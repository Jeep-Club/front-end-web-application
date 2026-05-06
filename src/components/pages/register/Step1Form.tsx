'use client';

import { useRouter } from 'next/navigation';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import { useRegisterStore } from '@/stores/useRegisterStore';
import { registerAction } from '@/actions/registerAction';
import { useState } from 'react';
import { Logo } from '@/components/common/logo';

const ESTADOS = [
    { label: 'Selecione', value: '' },
    { label: 'Acre', value: 'AC' },
    { label: 'Alagoas', value: 'AL' },
    { label: 'Amapá', value: 'AP' },
    { label: 'Amazonas', value: 'AM' },
    { label: 'Bahia', value: 'BA' },
    { label: 'Ceará', value: 'CE' },
    { label: 'Distrito Federal', value: 'DF' },
    { label: 'Espírito Santo', value: 'ES' },
    { label: 'Goiás', value: 'GO' },
    { label: 'Maranhão', value: 'MA' },
    { label: 'Mato Grosso', value: 'MT' },
    { label: 'Mato Grosso do Sul', value: 'MS' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Pará', value: 'PA' },
    { label: 'Paraíba', value: 'PB' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Pernambuco', value: 'PE' },
    { label: 'Piauí', value: 'PI' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Rio Grande do Norte', value: 'RN' },
    { label: 'Rio Grande do Sul', value: 'RS' },
    { label: 'Rondônia', value: 'RO' },
    { label: 'Roraima', value: 'RR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'São Paulo', value: 'SP' },
    { label: 'Sergipe', value: 'SE' },
    { label: 'Tocantins', value: 'TO' },
];

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

export default function Step1Form() {
    const router = useRouter();
    const { formData, setFormData, reset } = useRegisterStore();
    const [lgpdAccepted, setLgpdAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!lgpdAccepted) {
            setError('Você precisa aceitar os termos da LGPD para continuar.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await registerAction(formData);

            if (result?.success === false) {
                setError(result.error);
                return;
            }

            reset();
        } catch {
            setError('Erro ao realizar cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }

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

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <InputField
                            id="fullName"
                            label="Nome Completo"
                            value={formData.fullName}
                            onChange={(v) => setFormData({ fullName: v })}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="nickname"
                                label="Apelido"
                                value={formData.nickname ?? ''}
                                onChange={(v) => setFormData({ nickname: v })}
                            />
                            <InputField
                                id="cpf"
                                label="CPF"
                                value={formData.cpf}
                                onChange={(v) => setFormData({ cpf: maskCPF(v) })}
                                placeholder="000.000.000-00"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="rg"
                                label="RG"
                                value={formData.rg}
                                onChange={(v) => setFormData({ rg: v })}
                                required
                            />
                            <InputField
                                id="cnh"
                                label="CNH"
                                value={formData.cnh}
                                onChange={(v) => setFormData({ cnh: v })}
                                placeholder="Número da CNH"
                            />
                            <InputField
                                id="birthDate"
                                label="Data de Nascimento"
                                type="date"
                                value={formData.birthDate}
                                onChange={(v) => setFormData({ birthDate: v })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="phone"
                                label="Telefone"
                                type="tel"
                                value={formData.phone}
                                onChange={(v) => setFormData({ phone: maskPhone(v) })}
                                placeholder="(00) 00000-0000"
                                required
                            />
                            <InputField
                                id="memberSince"
                                label="Membro Desde"
                                type="date"
                                value={formData.memberSince}
                                onChange={(v) => setFormData({ memberSince: v })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectField
                                id="state"
                                label="Estado"
                                value={formData.state}
                                onChange={(v) => setFormData({ state: v })}
                                options={ESTADOS}
                                required
                            />
                            <InputField
                                id="city"
                                label="Cidade"
                                value={formData.city}
                                onChange={(v) => setFormData({ city: v })}
                                required
                            />
                        </div>

                        <InputField
                            id="email"
                            label="E-mail"
                            type="email"
                            value={formData.email}
                            onChange={(v) => setFormData({ email: v })}
                            placeholder="seu@email.com"
                            required
                        />

                        <InputField
                            id="password"
                            label="Senha"
                            type="password"
                            value={formData.password}
                            onChange={(v) => setFormData({ password: v })}
                            required
                        />

                        {/* LGPD */}
                        <div className="flex items-start gap-3 mt-1">
                            <input
                                id="lgpd"
                                type="checkbox"
                                checked={lgpdAccepted}
                                onChange={(e) => setLgpdAccepted(e.target.checked)}
                                className="mt-0.5 w-4 h-4 accent-[var(--blue-300)] cursor-pointer flex-shrink-0"
                            />
                            <label htmlFor="lgpd" className="text-[var(--fs-xs)] text-[var(--text-secundary)] cursor-pointer leading-relaxed">
                                Declaro que autorizo a coleta de dados conforme as diretrizes da LGPD.
                            </label>
                        </div>

                        {/* Erro */}
                        {error && (
                            <p className="text-[var(--fs-xs)] text-[var(--danger)] bg-[var(--red-100)]/10 border border-[var(--danger)] rounded-[var(--r-md)] px-3 py-2">
                                {error}
                            </p>
                        )}

                        {/* Botão submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !lgpdAccepted}
                            className="w-full bg-[var(--button-active)] hover:bg-[var(--button-hover)] disabled:bg-[var(--button-disabled)] disabled:cursor-not-allowed
                                text-[var(--button-text)] font-bold text-[var(--fs-sm)] uppercase tracking-widest py-4 rounded-[var(--r-md)]
                                transition-colors duration-200 mt-1 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Cadastrando...
                                </>
                            ) : (
                                'Finalizar Cadastro ›'
                            )}
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

                    </form>
                </div>
            </div>
        </div>
    );
}
