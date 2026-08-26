"use client";

import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { getUserProfileAction } from "@/actions/profile/get";
import { getMedicalProfileAction } from "@/actions/profile/medical-profile";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { EditPersonalDataModal } from "./EditPersonalDataModal";
import { MembershipCard } from "./MembershipCard";
import { PersonalDataCard } from "./PersonalDataCard";

const BLOOD_TYPE_LABELS: Record<MedicalProfileBloodType, string | null> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
    UNKNOWN: null,
};
export function PersonalDataTab() {
    const { setContent, setOpen } = useModal();
    const queryClient = useQueryClient();
    const {
        data: personalData,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getUserProfileAction,
    });
    const { data: medicalProfile } = useQuery({
        queryKey: ["medical-profile", "me"],
        queryFn: getMedicalProfileAction,
    });

    if (isLoading) {
        return (
            <p className="text-sm text-j-gray-400">
                Carregando dados pessoais...
            </p>
        );
    }

    if (isError || !personalData) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-j-red-400">
                    Não foi possível carregar seus dados pessoais.
                </p>
                <Button
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCw size={16} />
                    Tentar novamente
                </Button>
            </div>
        );
    }

    const handleOpenEdit = () => {
        setContent(
            <EditPersonalDataModal
                personalData={personalData}
                onSave={(updatedPersonalData) => {
                    queryClient.setQueryData(
                        ["profile", "me"],
                        updatedPersonalData,
                    );
                }}
            />,
        );
        setOpen();
    };

    return (
        <div className="grid w-full items-stretch gap-6 xl:grid-cols-2">
            <PersonalDataCard
                photoUrl={
                    personalData.profilePhotoUrl
                }
                fullName={personalData.name}
                roleLabel="Associado"
                memberSince={maskDate(personalData.createdAt, {
                    dateStyle: "long",
                    fallback: "Não informado",
                    includeTime: false,
                })}
                registrationNumber={`ID#${personalData.id}`}
                email={personalData.email}
                cpf={maskCPF(personalData.cpf)}
                rg={personalData.rg}
                phoneNumber={
                    personalData.phoneNumber
                        ? maskPhoneNumber(personalData.phoneNumber)
                        : null
                }
                birthDate={maskDate(personalData.birthDate, {
                    includeTime: false,
                })}
                onEdit={handleOpenEdit}
            />

            <MembershipCard
                profilePhotoUrl={
                    personalData.profilePhotoUrl
                }
                fullName={personalData.name}
                birthDate={
                    personalData.birthDate
                }
                memberSince={
                    personalData.createdAt
                }
                phoneNumber={
                    personalData.phoneNumber
                }
                roleLabel="Associado"
                registrationNumber={String(
                    personalData.id,
                )}
                bloodType={
                    medicalProfile?.bloodType
                        ? BLOOD_TYPE_LABELS[medicalProfile.bloodType]
                        : null
                }
                exportFileName={`carteirinha-${personalData.id}`}
            />
        </div>
    );
}

export default PersonalDataTab;
