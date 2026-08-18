"use client";

import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { getUserProfileAction } from "@/actions/profile/get";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { EditPersonalDataModal } from "./EditPersonalDataModal";
import { MembershipCard } from "./MembershipCard";
import { PersonalDataCard } from "./PersonalDataCard";

function formatMemberSince(createdAt: string) {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return "Não informado";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function PersonalDataTabContent() {
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
        <div className="mx-auto grid w-full max-w-[1104px] items-start justify-center gap-6 xl:grid-cols-[minmax(300px,360px)_minmax(0,720px)]">
            <PersonalDataCard
                photoUrl={
                    personalData.profilePhotoUrl
                }
                fullName={personalData.name}
                roleLabel="Associado"
                memberSince={formatMemberSince(
                    personalData.createdAt,
                )}
                registrationNumber={`ID#${personalData.id}`}
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
                issuedAt={
                    personalData.createdAt
                }
                phoneNumber={
                    personalData.phoneNumber
                }
                roleLabel="Associado"
                registrationNumber={String(
                    personalData.id,
                )}
                cityState={null}
                driverLicense={null}
                bloodType={null}
                exportFileName={`carteirinha-${personalData.id}`}
            />
        </div>
    );
}

export default PersonalDataTabContent;
