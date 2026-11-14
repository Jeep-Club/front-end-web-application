"use client";

import { useController, useFormContext, useWatch } from "react-hook-form";

import { Input } from "@/components/common/input/input";
import { InputRegister } from "@/components/common/input/input-register";
import { InputCheckbox } from "@/components/common/input/input-checkbox";
import { Select } from "@/components/common/select";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import {
    CHARGE_RECURRENCE_LABEL,
    PAYMENT_ACCEPTANCE_POLICY_LABEL,
} from "./chargeDefinitionDisplay";

// Keep the focused surface theme-aware so dark text tokens never sit on a forced white background.
const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400";

const RECURRENCE_OPTIONS: ChargeRecurrenceType[] = ["ONE_TIME", "MONTHLY", "YEARLY"];
const PAYMENT_POLICY_OPTIONS: PaymentAcceptancePolicy[] = [
    "UNTIL_DUE_DATE",
    "AFTER_DUE_DATE",
    "UNTIL_DAYS_AFTER_DUE_DATE",
];

export function ChargeDefinitionFormFields() {
    const { control } = useFormContext<ChargeDefinitionFormData>();
    const paymentAcceptancePolicy = useWatch({ control, name: "paymentAcceptancePolicy" });

    return (
        <>
            <InputRegister
                label="Nome da cobrança"
                name="name"
                placeholder="Ex.: Anuidade"
                maxLength={120}
                required
                labelClassName="text-j-gray-700"
                className={LIGHT_FIELD_CLASS}
            />

            <TextareaRegister
                label="Descrição"
                name="description"
                placeholder="Explique quando essa cobrança é aplicada."
                maxLength={255}
                rows={3}
                labelClassName="text-j-gray-700"
                className={LIGHT_FIELD_CLASS}
            />

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
                <CurrencyInputRegister />

                <Select
                    label="Tipo de recorrência"
                    name="recurrenceType"
                    required
                    labelClassName="text-j-gray-700"
                    className={LIGHT_FIELD_CLASS}
                >
                    <option value="">Selecione</option>
                    {RECURRENCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {CHARGE_RECURRENCE_LABEL[option]}
                        </option>
                    ))}
                </Select>
            </div>

            <Select
                label="Política de aceitação de pagamento"
                name="paymentAcceptancePolicy"
                required
                labelClassName="text-j-gray-700"
                className={LIGHT_FIELD_CLASS}
            >
                <option value="">Selecione</option>
                {PAYMENT_POLICY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                        {PAYMENT_ACCEPTANCE_POLICY_LABEL[option]}
                    </option>
                ))}
            </Select>

            {paymentAcceptancePolicy === "UNTIL_DAYS_AFTER_DUE_DATE" && (
                <InputRegister
                    type="number"
                    step="1"
                    min="1"
                    label="Dias de tolerância após o vencimento"
                    name="latePaymentGraceDays"
                    placeholder="15"
                    required
                    labelClassName="text-j-gray-700"
                    className={LIGHT_FIELD_CLASS}
                />
            )}

            <InputCheckbox
                label="Cobrança obrigatória para o público-alvo"
                name="required"
                className="rounded-xl border border-j-gray-200 bg-j-gray-100/60 p-3 [&>span:last-child]:!text-j-gray-700 [&>span:first-of-type]:!border-j-gray-300 [&>span:first-of-type]:!bg-j-white"
            />
        </>
    );
}

function formatCurrencyInput(value: number): string {
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function parseCurrencyInput(value: string): number | undefined {
    // Digits represent cents, including when editing an already formatted amount.
    const digits = value.replace(/\D/g, "");
    if (!digits) return undefined;
    const parsed = Number(digits) / 100;
    return Number.isFinite(parsed) ? parsed : undefined;
}

function CurrencyInputRegister() {
    const { control } = useFormContext<ChargeDefinitionFormData>();
    const { field, fieldState } = useController({ name: "defaultAmount", control });
    const { ref, name, onBlur, onChange, value: amount } = field;
    const value = typeof amount === "number" && Number.isFinite(amount) ? formatCurrencyInput(amount) : "";

    return (
        <Input
            ref={ref}
            label="Valor padrão (R$)"
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="250,00"
            required
            value={value}
            onChange={event => {
                const parsed = parseCurrencyInput(event.target.value);
                onChange(parsed);
            }}
            onBlur={onBlur}
            error={fieldState.error?.message}
            labelClassName="text-j-gray-700"
            className={LIGHT_FIELD_CLASS}
        />
    );
}

export default ChargeDefinitionFormFields;
