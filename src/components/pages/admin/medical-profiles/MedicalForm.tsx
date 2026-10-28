"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Form } from "@/components/common/form";
import { Button } from "@/components/common/button";
import { MedicalProfileFields } from "@/components/pages/profile/tabs/medical/EditMedicalProfileModal";
import { medicalProfileFormSchema, medicalProfileBloodTypeSchema } from "@/schemas/profile/medical-profile";
import { putMedicalProfileAction } from "@/actions/admin/medical-profile/put";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { MemberSelector, type MemberOption } from "@/components/pages/admin/MemberSelector";

export default function MedicalForm({ medicalProfile, onSaved }: { medicalProfile: GetMedicalProfileResponse | null; onSaved: () => void }) {
    const permissions = useUserStore(state => state.permissions);
    const canUpdate = hasPermission(permissions, "HEALTH", "MEDICAL_PROFILE_UPDATE");
    const [member, setMember] = useState<MemberOption | null>(null);
    const client = useQueryClient();
    const mutation = useMutation({
        mutationFn: putMedicalProfileAction,
        onSuccess: async () => {
            await client.invalidateQueries({ queryKey: ["admin", "medical-profiles"] });
            toast.success("Dados médicos salvos com sucesso!");
            onSaved();
        },
        onError: error => toast.error(error.message),
    });
    const defaultValues: MedicalProfileFormData = {
        bloodType: medicalProfileBloodTypeSchema.catch("UNKNOWN").parse(medicalProfile?.bloodType),
        allergies: medicalProfile?.allergies?.trim() || "Não se aplica",
        chronicConditions: medicalProfile?.chronicConditions?.trim() || "Não se aplica",
        continuousMedications: medicalProfile?.continuousMedications?.trim() || "Não se aplica",
        observations: medicalProfile?.observations?.trim() || "Não se aplica",
        healthInsuranceProvider: medicalProfile?.healthInsuranceProvider?.trim() || "Não se aplica",
        healthInsurancePlan: medicalProfile?.healthInsurancePlan?.trim() || "Não se aplica",
        healthInsuranceNumber: medicalProfile?.healthInsuranceNumber?.trim() || "Não se aplica",
        emergencyContactName: medicalProfile?.emergencyContactName ?? "",
        emergencyContactPhone: medicalProfile?.emergencyContactPhone ?? "",
        emergencyContactRelationship: medicalProfile?.emergencyContactRelationship ?? "",
    };
    if (!canUpdate) return <p>Acesso não permitido.</p>;
    return <Form<MedicalProfileFormData> schema={medicalProfileFormSchema} formOptions={{ defaultValues }} className="items-stretch gap-5" onError={() => toast.error("Revise os campos informados.")} onSubmit={async data => {
        const id = medicalProfile?.ownerId ?? member?.id;
        if (!id || !Number.isSafeInteger(id) || id <= 0) { toast.error("Pesquise e selecione o associado."); return; }
        try { await mutation.mutateAsync({ id, ownerType: medicalProfile?.ownerType ?? "USER", data }); } catch { /* Exibido pelo onError. */ }
    }}>
        <fieldset disabled={mutation.isPending} className="flex min-w-0 flex-col gap-5">
            {!medicalProfile && <section className="rounded-2xl border border-j-gray-200 bg-j-gray-100/40 p-4 md:p-5">
                <MemberSelector value={member} onChange={setMember} disabled={mutation.isPending} />
            </section>}
            <MedicalProfileFields />
        </fieldset>
        <div className="flex flex-col-reverse gap-3 border-t border-j-gray-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" onClick={onSaved} disabled={mutation.isPending} className="border-2 border-j-gray-200 bg-j-white px-5 text-j-gray-600 hover:bg-j-gray-100">Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending || (!medicalProfile && !member)} className="gap-2 bg-j-blue-700 px-6 text-j-white hover:bg-j-blue-800 hover:text-j-white">{mutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{mutation.isPending ? "Salvando..." : "Salvar alterações"}</Button>
        </div>
    </Form>;
}
