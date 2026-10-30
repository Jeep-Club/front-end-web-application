import { Suspense } from "react";
import PublicationManagement from "@/components/pages/admin/gestao-publicacoes";
import { simpleHaveRoutePermissions } from "@/utils/permission/routePermissions";

export default async function PublicationManagementPage() {
    await simpleHaveRoutePermissions("/admin/publications/service");
    return <Suspense fallback={<p className="p-4 text-sm text-j-gray-600">Carregando publicações...</p>}><PublicationManagement type="SERVICE" /></Suspense>;
}
