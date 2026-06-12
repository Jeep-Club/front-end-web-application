import { haveActionPermission } from "@/utils/permission/actionPermissions";

export async function Page() {
    const canUpdate = await haveActionPermission("HEALTH", "MEDICAL_PROFILE_UPDATE");

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Perfil Médico</h1>
            <p>Conteúdo do perfil médico...</p>
        </div>
    );
}