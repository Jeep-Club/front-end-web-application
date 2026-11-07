import { redirect } from "next/navigation";
import { simpleHaveRoutePermissions } from "@/utils/permission/routePermissions";

export default async function EventManagementPage() {
    await simpleHaveRoutePermissions("/admin/gestao-eventos");
    redirect("/admin/gestao-publicacoes");
}