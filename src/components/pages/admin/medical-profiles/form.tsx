'use client';

import { Button } from "@/components/common/button";
import { Form } from "@/components/common/form";
import { Input } from "@/components/common/input";
import { InputPhoneNumber } from "@/components/common/input/input-phonenumber";
import Link from "next/link";
import { putMedicalProfileRequestSchema } from "@/schemas/admin/medical-profile";
import { putMedicalProfileAction } from "@/server/actions/admin/medical-profile/put";
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle,Save } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function FormPutMedicalProfile({ id, medicalProfile}: { id: number, medicalProfile: GetMedicalProfileResponse | null }) {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: putMedicalProfileAction,
        onSuccess: () => { router.push(`/admin/medical-profile/${id}`); toast.success('Perfil médico atualizado com sucesso!'); }
    });

    const isLoading = mutation.isPending;

    const handleSubmit = async (data: PutMedicalProfileDependentRequest) => {
        mutation.mutateAsync({ id: medicalProfile?.ownerId ?? id, ownerType: medicalProfile?.ownerType ?? 'USER', data });
    }

    const defaultValues: PutMedicalProfile | undefined = medicalProfile ? {
        bloodType: medicalProfile.bloodType,
        allergies: medicalProfile.allergies,
        chronicConditions: medicalProfile.chronicConditions,
        continuousMedications: medicalProfile.continuousMedications,
        observations: medicalProfile.observations,
        healthInsuranceProvider: medicalProfile.healthInsuranceProvider,
        healthInsurancePlan: medicalProfile.healthInsurancePlan,
        healthInsuranceNumber: medicalProfile.healthInsuranceNumber,
        emergencyContactName: medicalProfile.emergencyContactName,
        emergencyContactPhone: medicalProfile.emergencyContactPhone,
        emergencyContactRelationship: medicalProfile.emergencyContactRelationship,
    } : undefined;
    console.log("Default Values:", defaultValues);
    return (
        <div className="w-full flex flex-col items-center justify-center gap-5 p-5">
            <p className="w-full rounded-xl border border-j-blue-100 bg-j-blue-100/10 p-4 text-sm leading-6 text-j-gray-600">
                Dados de saúde são sensíveis. Antes de registrar ou alterar informações, verifique a autorização específica do titular ou responsável e o fundamento legal documentado pela administração.
                O cadastro no clube não substitui essa autorização. Acesse apenas os dados necessários à sua função e evite informações excessivas.
                Consulte a <Link href="/politica-de-privacidade#saude-menores" className="font-medium text-j-blue-700 underline underline-offset-4">Política de Privacidade</Link>.
            </p>
            <Form<PutMedicalProfile>
                schema={putMedicalProfileRequestSchema}
                onSubmit={handleSubmit}
                onError={(errors) => console.error(errors)}
                formOptions={{defaultValues: defaultValues}}
                className="w-full flex flex-col gap-4"
            >
                {/* Informações Básicas e Médicas */}
                <Input name="bloodType" label="Tipo Sanguíneo" placeholder="Ex: O_POSITIVE" required />
                <Input name="allergies" label="Alergias" placeholder="Descreva as alergias (ou 'Nenhuma')" />
                <Input name="chronicConditions" label="Condições Crônicas" placeholder="Ex: Asma, Diabetes" />
                <Input name="continuousMedications" label="Medicações Contínuas" placeholder="Remédios de uso diário" />
                <Input name="observations" label="Observações Adicionais" placeholder="Qualquer outra informação relevante" />

                {/* Plano de Saúde */}
                <div className="w-full flex flex-col gap-4 p-4 border border-gray-200 rounded-md mt-2">
                    <h3 className="text-sm font-semibold text-gray-500">Dados do Plano de Saúde</h3>
                    <Input name="healthInsuranceProvider" label="Operadora do Plano" placeholder="Ex: Unimed, Bradesco Saúde" />
                    <Input name="healthInsurancePlan" label="Nome do Plano" placeholder="Ex: Nacional Flex" />
                    <Input name="healthInsuranceNumber" label="Número da Carteirinha" placeholder="Ex: 123456789" />
                </div>

                {/* Contato de Emergência */}
                <div className="w-full flex flex-col gap-4 p-4 border border-gray-200 rounded-md mt-2">
                    <h3 className="text-sm font-semibold text-gray-500">Contato de Emergência</h3>
                    <Input name="emergencyContactName" label="Nome do Contato" placeholder="Nome completo" required />
                    <InputPhoneNumber name="emergencyContactPhone" label="Telefone de Emergência" required />
                    <Input name="emergencyContactRelationship" label="Grau de Parentesco" placeholder="Ex: Mãe, Cônjuge" required />
                </div>

                {/* Botão de Submissão */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4"
                >
                    {isLoading ? (
                        <>Salvando <LoaderCircle size={15} strokeWidth={3} className="animate-spin ml-2" /></>
                    ) : (
                        <>Salvar Perfil <Save size={15} strokeWidth={3} className="ml-2" /></>
                    )}
                </Button>
            </Form>
        </div>
    );
}
