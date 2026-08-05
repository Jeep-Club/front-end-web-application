"use client";

import { useState } from "react";
import { MembershipCard } from "./MembershipCard";
import { useModal } from "@/providers/ModalProvider";

import { EditPersonalDataModal } from "./EditPersonalDataModal";
import { PersonalDataCard } from "./PersonalDataCard";

const INITIAL_PERSONAL_DATA: GetUserProfileResponse = {
    id: 10293,
    name: "João Gabriel de Faria Beserra",
    birthDate: "2004-08-15",
    email: "joao.gabriel@email.com",
    cpf: "52998224725",
    rg: "491234567",
    phoneNumber: "12999999999",
    profilePhotoUrl: null,
    status: "ACTIVE",
    createdAt: "2026-01-12T14:30:00Z",
    lastLoginAt: "2026-08-05T13:20:00Z",
};

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

export function PersonalDataTab() {
    const { setContent, setOpen } = useModal();

    const [personalData, setPersonalData] =
        useState<GetUserProfileResponse>(
            INITIAL_PERSONAL_DATA,
        );

    const handleOpenEdit = () => {
        setContent(
            <EditPersonalDataModal
                personalData={personalData}
                onSave={setPersonalData}
            />,
        );

        setOpen();
    };

    return (
    <div className="grid w-full items-start gap-5 xl:grid-cols-[320px_minmax(0,640px)]">
        <PersonalDataCard
            photoUrl={personalData.profilePhotoUrl}
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
    birthDate={personalData.birthDate}
    memberSince={personalData.createdAt}
    phoneNumber={
        personalData.phoneNumber
    }
    roleLabel="Associado"
    registrationNumber={String(
        personalData.id,
    )}
    cityState="SP - Caraguatatuba"
    driverLicense="B"
    bloodType="O+"
/>
    </div>
);
}

export default PersonalDataTab;