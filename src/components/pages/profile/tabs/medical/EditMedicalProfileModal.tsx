"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HeartPulse, LoaderCircle, Save, X } from "lucide-react";
import toast from "react-hot-toast";

import { saveMedicalProfileAction } from "@/actions/profile/medical-profile";
import { Button, ButtonIcon } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { InputRegister } from "@/components/common/input/input-register";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textarea";
import { useModal } from "@/providers/ModalProvider";
import { medicalProfileFormSchema } from "@/schemas/profile/medical-profile";
import { maskPhoneNumber } from "@/utils/masks/maskPhoneNumber";

interface EditMedicalProfileModalProps {
    medicalProfile: MedicalProfile | null;
}

const BLOOD_TYPES: Array<{ value: MedicalProfileBloodType; label: string }> = [
    { value: "UNKNOWN", label: "Não informado" },
    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },
    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },
    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },
];

const fieldClassName = "border-j-gray-200 bg-j-gray-100 px-4 py-3 text-j-gray-700 placeholder:text-j-gray-400 focus:bg-j-white";

export function EditMedicalProfileModal({ medicalProfile }: EditMedicalProfileModalProps) {
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: saveMedicalProfileAction,
        onSuccess: (savedProfile) => {
            queryClient.setQueryData(["medical-profile", "me"], savedProfile);
            toast.success("Perfil médico atualizado com sucesso!");
            setClose();
        },
        onError: (error) => toast.error(error.message || "Erro ao salvar o perfil médico."),
    });

    const defaultValues: MedicalProfileFormData = {
        bloodType: medicalProfile?.bloodType ?? "UNKNOWN",
        allergies: medicalProfile?.allergies ?? "",
        chronicConditions: medicalProfile?.chronicConditions ?? "",
        continuousMedications: medicalProfile?.continuousMedications ?? "",
        healthInsuranceProvider: medicalProfile?.healthInsuranceProvider ?? "",
        healthInsurancePlan: medicalProfile?.healthInsurancePlan ?? "",
        healthInsuranceNumber: medicalProfile?.healthInsuranceNumber ?? "",
        emergencyContactName: medicalProfile?.emergencyContactName ?? "",
        emergencyContactPhone: medicalProfile?.emergencyContactPhone ?? "",
        emergencyContactRelationship: medicalProfile?.emergencyContactRelationship ?? "",
        observations: medicalProfile?.observations ?? "",
    };

    return (
        <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
            <ButtonIcon
                type="button"
                onClick={setClose}
                title="Fechar"
                className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
            >
                <X size={22} />
            </ButtonIcon>

            <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <HeartPulse size={21} />
                    </span>
                    <div>
                        <h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                            {medicalProfile ? "Editar perfil médico" : "Cadastrar perfil médico"}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-j-gray-500 md:text-sm">
                            Mantenha estes dados atualizados para situações de emergência.
                        </p>
                    </div>
                </div>
            </header>

            <Form<MedicalProfileFormData>
                schema={medicalProfileFormSchema}
                formOptions={{ defaultValues }}
                onSubmit={(data) => mutation.mutate(data)}
                onError={() => toast.error("Revise os campos informados.")}
                className="items-stretch gap-5 px-5 pt-5 md:px-8 md:pt-6"
            >
                <FormSection title="Informações médicas">
                    <Select
                        name="bloodType"
                        label="Tipo sanguíneo"
                        className={fieldClassName}
                    >
                        {BLOOD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </Select>
                    <Textarea
                        name="allergies"
                        label="Alergias"
                        placeholder="Ex.: dipirona, amendoim"
                        maxLength={2000}
                        className={fieldClassName}
                    />
                    <Textarea
                        name="chronicConditions"
                        label="Condições crônicas"
                        placeholder="Ex.: asma, diabetes"
                        maxLength={2000}
                        className={fieldClassName}
                    />
                    <Textarea
                        name="continuousMedications"
                        label="Medicamentos de uso contínuo"
                        placeholder="Informe medicamento, dose e frequência"
                        maxLength={2000}
                        className={fieldClassName}
                    />
                </FormSection>

                <FormSection title="Plano de saúde" columns>
                    <InputRegister name="healthInsuranceProvider" label="Operadora" placeholder="Ex.: Unimed" maxLength={120} labelClassName="text-j-gray-700" className={fieldClassName} />
                    <InputRegister name="healthInsurancePlan" label="Plano" placeholder="Ex.: Nacional" maxLength={120} labelClassName="text-j-gray-700" className={fieldClassName} />
                    <InputRegister name="healthInsuranceNumber" label="Número da carteirinha" placeholder="Número de identificação" maxLength={80} labelClassName="text-j-gray-700" className={fieldClassName} />
                </FormSection>

                <FormSection title="Contato de emergência" columns>
                    <InputRegister name="emergencyContactName" label="Nome" placeholder="Nome do contato" maxLength={120} labelClassName="text-j-gray-700" className={fieldClassName} />
                    <InputRegister name="emergencyContactPhone" label="Telefone" placeholder="(12) 99999-9999" maxLength={20} mask={maskPhoneNumber} labelClassName="text-j-gray-700" className={fieldClassName} />
                    <InputRegister name="emergencyContactRelationship" label="Parentesco" placeholder="Ex.: mãe, cônjuge" maxLength={80} labelClassName="text-j-gray-700" className={fieldClassName} />
                </FormSection>

                <Textarea
                    name="observations"
                    label="Observações"
                    placeholder="Outras informações importantes"
                    maxLength={2000}
                    className={fieldClassName}
                />

                <div className="-mx-5 mt-1 flex flex-col-reverse gap-3 border-t border-j-blue-100 bg-j-blue-100/10 px-5 py-5 sm:flex-row sm:justify-end md:-mx-8 md:px-8">
                    <Button type="button" onClick={setClose} disabled={mutation.isPending} className="border-2 border-j-gray-200 bg-j-white px-5 text-j-gray-600 hover:bg-j-gray-100 hover:text-j-gray-700">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-j-blue-700 px-6 text-j-white hover:bg-j-blue-800 hover:text-j-white">
                        {mutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                        {mutation.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

function FormSection({ title, columns = false, children }: { title: string; columns?: boolean; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-gray-100/40 p-4 [&_label]:!text-j-gray-700 md:p-5">
            <h3 className="border-b border-j-gray-200 pb-3 text-sm font-extrabold text-j-blue-800">{title}</h3>
            <div className={columns ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"}>{children}</div>
        </section>
    );
}

export default EditMedicalProfileModal;
