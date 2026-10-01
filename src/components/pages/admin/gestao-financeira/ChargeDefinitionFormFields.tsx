"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { InputRegister } from "@/components/common/input/input-register";
import { InputCheckbox } from "@/components/common/input/input-checkbox";
import { Select } from "@/components/common/select";
import { TextareaRegister } from "@/components/common/textarea/textarea-register";
import {
    CHARGE_RECURRENCE_LABEL,
    PAYMENT_ACCEPTANCE_POLICY_LABEL,
} from "./chargeDefinitionDisplay";

const LIGHT_FIELD_CLASS = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

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
            <div id="tour-charge-field-name-desc" className="flex flex-col gap-4">
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
            </div>

            <div id="tour-charge-field-amount-recurrence" className="grid gap-4 sm:grid-cols-2">
                <InputRegister
                    type="number"
                    step="0.01"
                    min="0.01"
                    label="Valor padrão (R$)"
                    name="defaultAmount"
                    placeholder="250.00"
                    required
                    labelClassName="text-j-gray-700"
                    className={LIGHT_FIELD_CLASS}
                />

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

            <div id="tour-charge-field-policy" className="flex flex-col gap-4">
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
            </div>

            <div id="tour-charge-field-required">
                <InputCheckbox
                    label="Cobrança obrigatória para o público-alvo"
                    name="required"
                    className="rounded-xl border border-j-gray-200 bg-j-gray-100/60 p-3 [&>span:last-child]:!text-j-gray-700 [&>span:first-of-type]:!border-j-gray-300 [&>span:first-of-type]:!bg-j-white"
                />
            </div>
        </>
    );
}

export default ChargeDefinitionFormFields;
