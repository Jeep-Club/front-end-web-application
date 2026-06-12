import MedicalProfilesListPage from "@/components/pages/admin/medical-profiles";
import { getAllMedicalProfilesResponseSchema } from "@/schemas/admin/medical-profile";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import SimpleTable from "@/components/common/table/simple";

interface Props {
    searchParams: Promise<{
        size?: string;
        page?: string;
    }>
}

export default async function Page({ searchParams }: Props) {
    // Resolve os searchParams (necessário nas versões mais recentes do Next.js 14+)
    const { size, page } = await searchParams;
    
    const currentPage = Number(page) || 0;
    const currentSize = Number(size) || 10;

    // Faz o fetch dos dados
    const response = await serverFetchWrapper<GetListMedicalProfilesResponse>({
        url: `${HttpAPIRoutes.ADMIN_MEDICAL_PROFILES}?size=${currentSize}&page=${currentPage}`,
        method: "GET",
        schema: getAllMedicalProfilesResponseSchema
    });

    // Definimos as chaves baseadas no tipo unitário da resposta
    const tableColumns: (keyof GetListMedicalProfilesResponse[0])[] = [
        "id", 
        "ownerType", 
        "ownerId", 
        "bloodType", 
        "updatedAt"
    ];

    return <MedicalProfilesListPage data={response.data} currentPage={currentPage} />;
}