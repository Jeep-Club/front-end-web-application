'use client';

import SimpleTable from "@/components/common/table/simple";
import { useRouter } from "next/navigation";

interface Props {
    data: GetListMedicalProfilesResponse;
    currentPage: number;
}

export default function AdminMedicalProfilesListPage({ data, currentPage }: Props) {
    const router = useRouter();
    
    const rows = data.content;
    const tableColumns: (keyof MedicalProfileSummary)[] = ['id', 'ownerType', 'ownerId', 'updatedAt'];

    function onView(row: MedicalProfileSummary) {
        router.push(`/admin/medical-profile/${row.id}`);
    }
    return (
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Perfil Médico</h1>
                <p className="text-gray-600">Listagem de perfis médicos dos usuários.</p>
                
                <SimpleTable<MedicalProfileSummary>
                    columns={tableColumns}
                    data={rows}
                    currentPage={currentPage + 1}
                    totalPages={data.totalPages}
                    onView={onView}
                />
            </div>
        );
}
