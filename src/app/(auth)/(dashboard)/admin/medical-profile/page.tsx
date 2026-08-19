import MedicalProfilesListPage from "@/components/pages/admin/medical-profiles";
import { getAllMedicalProfilesResponseSchema } from "@/schemas/admin/medical-profile";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import z from "zod";

interface Props {
    searchParams: Promise<{
        size?: string;
        page?: string;
    }>
}

export default async function Page({ searchParams }: Props) {
    const { size, page } = await searchParams;
    
    const currentPage = Number(page) || 0;
    const currentSize = Number(size) || 10;

    const response = await serverFetchWrapper<GetListMedicalProfilesResponse>({
        url: `${HttpAPIRoutes.ADMIN_MEDICAL_PROFILES}?size=${currentSize}&page=${currentPage}`,
        method: "GET",
        schema: getAllMedicalProfilesResponseSchema
    });


    return <MedicalProfilesListPage data={response.data} currentPage={currentPage} />;
}