'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HelpCircle, X } from "lucide-react";

import { Form } from "@/components/common/form";
import { Button, ButtonIcon } from "@/components/common/button";
import { usePageTour } from "@/hooks/useTour";
import { getCreateChargeDefinitionTourSteps } from "@/config/tourSteps";
import { useModal } from "@/providers/ModalProvider";
import { chargeDefinitionFormSchema } from "@/schemas/billing/chargeDefinition";
import { createChargeDefinitionAction } from "@/actions/billing/chargeDefinitions/create";
import { ChargeDefinitionFormFields } from "./ChargeDefinitionFormFields";

export function CreateChargeDefinitionModal() {
    const { setClose } = useModal();
    const queryClient = useQueryClient();

    const { restartTour } = usePageTour({
        storageKey: "tour_completed_charge_create_modal",
        steps: getCreateChargeDefinitionTourSteps,
        autoStartOnFirstVisit: true,
        enabled: true,
    });

    const mutation = useMutation({
        mutationFn: (data: ChargeDefinitionFormData) => createChargeDefinitionAction(data),
        onSuccess: () => {
            toast.success("Definição de cobrança criada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["billing", "charge-definitions"] });
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao criar definição de cobrança."),
    });

    const handleSubmit = async (data: ChargeDefinitionFormData) => {
        mutation.mutateAsync(data);
    };

    return (
        <div
            className={`
                relative flex max-h-[92dvh] w-full max-w-2xl
                flex-col overflow-y-auto overflow-x-hidden
                rounded-3xl bg-j-white shadow-2xl
            `}
        >
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 md:right-6 md:top-6">
                <ButtonIcon
                    type="button"
                    title="Ajuda sobre os campos"
                    aria-label="Ajuda sobre os campos"
                    onClick={restartTour}
                    className="rounded-full bg-j-gray-100 p-2 text-j-blue-800 hover:bg-j-yellow-300 hover:text-j-blue-900 transition-colors"
                >
                    <HelpCircle className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </ButtonIcon>
                <ButtonIcon
                    onClick={setClose}
                    className="rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800"
                >
                    <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </ButtonIcon>
            </div>

            <header id="tour-charge-modal-header" className="border-b border-j-gray-200 px-5 pb-5 pr-24 pt-6 md:px-8 md:pb-6 md:pr-28 md:pt-8">
                <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                    Criar definição de cobrança
                </h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                    Configure um modelo de cobrança que poderá ser usado para gerar débitos para os associados.
                </p>
            </header>

            <Form<ChargeDefinitionFormData>
                schema={chargeDefinitionFormSchema}
                formOptions={{
                    defaultValues: {
                        name: "",
                        description: "",
                        recurrenceType: "" as ChargeRecurrenceType,
                        required: false,
                        paymentAcceptancePolicy: "" as PaymentAcceptancePolicy,
                    },
                }}
                onSubmit={handleSubmit}
                onError={(errors) => console.log(errors)}
                className="gap-4 px-5 py-5 md:px-8 md:py-6"
            >
                <ChargeDefinitionFormFields />

                <div id="tour-charge-btn-submit" className="flex w-full gap-3 border-t border-j-gray-200 pt-5">
                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1"
                    >
                        {mutation.isPending ? "Criando..." : "Criar definição"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default CreateChargeDefinitionModal;
