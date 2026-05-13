'use client';

import { useFormContext, useController } from 'react-hook-form';
import { RegisterFormData } from '@/schemas/registerSchema';

type FormValues = RegisterFormData & { lgpd: boolean };

interface LgpdCheckboxProps {
    onChange?: (value: boolean) => void;
}

export function LgpdCheckbox({ onChange }: LgpdCheckboxProps) {
    const {
        control,
        formState: { errors },
    } = useFormContext<FormValues>();

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
                    onChange={(e) => {
                        field.onChange(e.target.checked);
                        onChange?.(e.target.checked);
                    }}
                    className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[var(--blue-300)] cursor-pointer"
                />
                <label
                    htmlFor="lgpd"
                    className="text-1xl text-[var(--text-secundary)] text-j-gray-300 leading-relaxed cursor-pointer"
                >
                    Declaro que autorizo a coleta e armazenamento dos meus dados
                    conforme as diretrizes da{' '}
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