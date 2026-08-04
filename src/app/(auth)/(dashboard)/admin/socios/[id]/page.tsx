import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { getAllDependentsResponseSchema } from "@/schemas/admin/dependent";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function Page({ params }: Props) {

    const { id } = await params;

    const canUpdate = await haveActionPermission("DEPENDENTS", "DEPENDENTS_DEPENDENT_READ");

    const response = await serverFetchWrapper<GetListDependentsResponse>({
        url: `socios/${id}/dependents`,
        method: "GET",
        schema: getAllDependentsResponseSchema
    });

    return (
        <div>
            <h1>Dependentes do Sócio {id}</h1>
            <ul>
                {response.data.map((dependent) => (
                    <li key={dependent.id}>
                        {dependent.name} - {dependent.relationshipType}
                    </li>
                ))}
            </ul>
        </div>
    );
}