'use client';

import SimpleTable from "@/components/common/table/simple";
import { useRouter } from "next/navigation";

interface Props {
    data: GetListMedicalProfilesResponse;
    currentPage: number;
}

export default function AdminMedicalProfilesListPage({ data, currentPage }: Props) {
    const router = useRouter();
    
    const tableColumns: (keyof GetListMedicalProfilesResponse[0])[] = Object.keys(data[0] || {}) as (keyof GetListMedicalProfilesResponse[0])[];

    function onView(row: GetListMedicalProfilesResponse[0]) {
        router.push(`/admin/medical-profile/${row.id}`);
    }
    return (
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold">Perfil Médico</h1>
                <p className="text-gray-600">Listagem de perfis médicos dos usuários.</p>
                
                <SimpleTable<GetListMedicalProfilesResponse[0]>
                    columns={tableColumns}
                    data={data || []}
                    currentPage={currentPage}
                    onView={onView}
                />
            </div>
        );
}