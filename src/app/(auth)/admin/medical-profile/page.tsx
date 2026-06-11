import { simpleHaveRoutePermissions } from "@/utils/permission/routePermissions";

export default async function Page() {



    await simpleHaveRoutePermissions('/admin/medical-profile');

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Perfil Médico</h1>
            <p>Conteúdo do perfil médico...</p>
        </div>
    );

}