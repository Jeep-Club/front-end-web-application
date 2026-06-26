import AdminMedicalProfilePage from "@/components/pages/admin/medical-profiles/[id]";
import { getMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function Page({ params }: Props) {

    const { id } = await params;
    const canUpdate = await haveActionPermission("HEALTH", "MEDICAL_PROFILE_UPDATE");

    //id
    const response = await serverFetchWrapper<any>({
        url: `${HttpAPIRoutes.ADMIN_MEDICAL_PROFILES}/${id}`,
        method: "GET",
        schema: getMedicalProfileResponseSchema
    });

    // //ownerID
    // const response = await serverFetchWrapper<any>({
    //     url: `${HttpAPIRoutes.ADMIN_MEDICAL_PROFILES}/users/1`,
    //     method: "GET",
    //     schema: getMedicalProfileResponseSchema
    // });

    return <AdminMedicalProfilePage canUpdate={canUpdate} medicalProfile={response.data} />;
}