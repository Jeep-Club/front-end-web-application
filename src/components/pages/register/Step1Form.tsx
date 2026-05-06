'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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

type FormValues = {
    fullName: string;
    nickname: string;
    cpf: string;
    rg: string;
    cnh: string;
    birthDate: string;
    memberSince: string;
    phone: string;
    state: string;
    city: string;
    email: string;
    password: string;
    lgpd: boolean;
};

export default function Step1Form() {
    const router = useRouter();
    const { reset } = useRegisterStore();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            fullName: '',
            nickname: '',
            cpf: '',
            rg: '',
            cnh: '',
            birthDate: '',
            memberSince: '',
            phone: '',
            state: '',
            city: '',
            email: '',
            password: '',
            lgpd: false,
        },
    });

    const lgpdAccepted = watch('lgpd');

    const onSubmit = async (data: FormValues) => {
        setServerError(null);
        try {
            const { lgpd, ...payload } = data;
            const result = await registerAction(payload);
            if (result?.success === false) {
                setServerError(result.error);
                return;
            }
            reset();
        } catch {
            setServerError('Erro ao realizar cadastro. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">

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

                    <div className="w-full h-1.5 bg-[var(--gray-200)] rounded-full mb-7 overflow-hidden">
                        <div className="h-full w-1/2 bg-[var(--blue-300)] rounded-full transition-all duration-500" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        <Controller
                            name="fullName"
                            control={control}
                            rules={{ required: 'Nome completo é obrigatório' }}
                            render={({ field }) => (
                                <InputField
                                    id="fullName"
                                    label="Nome Completo"
                                    value={field.value}
                                    onChange={field.onChange}
                                    required
                                    error={errors.fullName?.message}
                                />
                            )}
                        />

                        <div className="color-black grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="nickname"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="nickname"
                                        label="Apelido"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                name="cpf"
                                control={control}
                                rules={{ required: 'CPF é obrigatório' }}
                                render={({ field }) => (
                                    <InputField
                                        id="cpf"
                                        label="CPF"
                                        placeholder="000.000.000-00"
                                        value={field.value}
                                        onChange={(v) => field.onChange(maskCPF(v))}
                                        required
                                        error={errors.cpf?.message}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="rg"
                                control={control}
                                rules={{ required: 'RG é obrigatório' }}
                                render={({ field }) => (
                                    <InputField
                                        id="rg"
                                        label="RG"
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                        error={errors.rg?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="cnh"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="cnh"
                                        label="CNH"
                                        placeholder="Número da CNH"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="birthDate"
                                control={control}
                                rules={{ required: 'Data de nascimento é obrigatória' }}
                                render={({ field }) => (
                                    <InputField
                                        id="birthDate"
                                        label="Data de Nascimento"
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                        error={errors.birthDate?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="memberSince"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        id="memberSince"
                                        label="Membro Desde"
                                        type="date"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Controller
                                name="phone"
                                control={control}
                                rules={{ required: 'Telefone é obrigatório' }}
                                render={({ field }) => (
                                    <InputField
                                        id="phone"
                                        label="Telefone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={field.value}
                                        onChange={(v) => field.onChange(maskPhone(v))}
                                        required
                                        error={errors.phone?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="state"
                                control={control}
                                rules={{ required: 'Estado é obrigatório' }}
                                render={({ field }) => (
                                    <SelectField
                                        id="state"
                                        label="Estado"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={ESTADOS}
                                        required
                                        error={errors.state?.message}
                                    />
                                )}
                            />
                        </div>

                        <Controller
                            name="city"
                            control={control}
                            rules={{ required: 'Cidade é obrigatória' }}
                            render={({ field }) => (
                                <InputField
                                    id="city"
                                    label="Cidade"
                                    value={field.value}
                                    onChange={field.onChange}
                                    required
                                    error={errors.city?.message}
                                />
                            )}
                        />

                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'E-mail inválido',
                                },
                            }}
                            render={({ field }) => (
                                <InputField
                                    id="email"
                                    label="E-mail"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={{
                                required: 'Senha é obrigatória',
                                minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
                            }}
                            render={({ field }) => (
                                <InputField
                                    id="password"
                                    label="Senha"
                                    type="password"
                                    value={field.value}
                                    onChange={field.onChange}
                                    required
                                    error={errors.password?.message}
                                />
                            )}
                        />

                        <Controller
                            name="lgpd"
                            control={control}
                            rules={{ required: 'Você precisa aceitar os termos da LGPD para continuar.' }}
                            render={({ field }) => (
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-start gap-3 mt-1">
                                        <input
                                            id="lgpd"
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 accent-[var(--blue-300)] cursor-pointer flex-shrink-0"
                                        />
                                        <label htmlFor="lgpd" className="text-[var(--fs-xs)] text-[var(--text-secundary)] cursor-pointer leading-relaxed">
                                            Declaro que autorizo a coleta de dados conforme as diretrizes da LGPD.
                                        </label>
                                    </div>
                                    {errors.lgpd && (
                                       <span className="text-[var(--fs-xs)] text-red-500">{errors.lgpd.message}</span>
                                    )}
                                </div>
                            )}
                        />

        
                        {serverError && (
                            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500 rounded-[var(--r-md)] px-3 py-2">
                                {serverError}
                            </p>
                        )}

                  
                        <button
                            type="submit"
                            disabled={isSubmitting || !lgpdAccepted}
                            className="w-full bg-[var(--button-active)] hover:bg-[var(--button-hover)] disabled:bg-[var(--button-disabled)] disabled:cursor-not-allowed
                                text-[var(--button-text)] font-bold text-[var(--fs-sm)] uppercase tracking-widest py-4 rounded-[var(--r-md)]
                                transition-colors duration-200 mt-1 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
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
                                onClick={() => router.push('/dashboard')}
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