'use client';

import FormPutMedicalProfile from "../../form";


interface Props {
    id: number;
    medicalProfile: GetMedicalProfileResponse | null;
}


export default function AdminMedicalProfileEditPage({ id, medicalProfile }: Props) {
    return (
        <div className="flex flex-col gap-6 p-6">
            <h1 className="text-2xl font-bold">Editar Perfil Médico</h1>
            <p className="text-gray-600">Atualize as informações do perfil médico do usuário.</p>
            <FormPutMedicalProfile id={id} medicalProfile={medicalProfile || null} />
        </div>
    );
}