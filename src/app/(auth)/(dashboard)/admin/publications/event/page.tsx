import { Suspense } from "react";
import PublicationManagement from "@/components/pages/admin/publications";
import { simpleHaveRoutePermissions } from "@/utils/permission/routePermissions";

export default async function PublicationManagementPage() {
    await simpleHaveRoutePermissions("/admin/publications/event");
    return <Suspense fallback={<p className="p-4 text-sm text-j-gray-600">Carregando publicações...</p>}><PublicationManagement type="EVENT" /></Suspense>;
}
