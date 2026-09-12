"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, X } from "lucide-react";
import toast from "react-hot-toast";

import { generateChargeCycleAction } from "@/actions/billing/chargeCycles/generate";
import { Button, ButtonIcon } from "@/components/common/button";
import { Input } from "@/components/common/input/input";
import { useModal } from "@/providers/ModalProvider";

interface GenerateChargeCycleModalProps {
    chargeDefinitionId: number;
    chargeDefinitionName: string;
}

export function GenerateChargeCycleModal({
    chargeDefinitionId,
    chargeDefinitionName,
}: GenerateChargeCycleModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const [code, setCode] = useState("");
    const [dueDate, setDueDate] = useState("");

    const mutation = useMutation({
        mutationFn: () => generateChargeCycleAction(chargeDefinitionId, {
            code: code.trim(),
            dueDate,
        }),
        onSuccess: (createdMemberCharges) => {
            if (createdMemberCharges === 0) {
                toast("Ciclo gerado, mas nenhum usuário elegível recebeu a cobrança.");
            } else {
                toast.success(`Ciclo gerado: ${createdMemberCharges} cobrança(s) criada(s).`);
            }

            queryClient.invalidateQueries({ queryKey: ["billing"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao gerar cobrança."),
    });

    const canSubmit = code.trim().length > 0 && dueDate.length > 0;

    return (
        <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon
                type="button"
                onClick={setClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X className="h-5 w-5" />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-j-blue-50 p-2.5 text-j-blue-800">
                        <CalendarPlus size={21} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            Gerar cobrança
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            {chargeDefinitionName}
                        </p>
                    </div>
                </div>
            </header>

            <form
                className="flex flex-col gap-4 px-5 py-5 md:px-8 md:py-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    mutation.mutate();
                }}
            >
                <p className="text-sm leading-relaxed text-j-gray-600">
                    O ciclo criará uma cobrança no histórico de cada usuário incluído nas atribuições ativas.
                </p>

                <Input
                    required
                    maxLength={80}
                    label="Código do ciclo"
                    name="code"
                    placeholder="Ex.: SET-2026"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    labelClassName="text-j-gray-700"
                    className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white"
                />

                <Input
                    required
                    type="date"
                    label="Data de vencimento"
                    name="dueDate"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    labelClassName="text-j-gray-700"
                    className="border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 focus:bg-j-white"
                />

                <div className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                    <Button
                        type="submit"
                        disabled={!canSubmit || mutation.isPending}
                        className="flex-1"
                    >
                        {mutation.isPending ? "Gerando..." : "Gerar cobrança"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default GenerateChargeCycleModal;
