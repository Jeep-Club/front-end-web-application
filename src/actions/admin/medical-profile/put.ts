'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { putMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";
import { extractApiErrorMessage } from '@/utils/http/apiError';

interface Props {
    id: number;
    ownerType: string;
    data: PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest;
}

export async function putMedicalProfileAction({ id, ownerType, data }: Props) {
    try {
            const ownerPath = ownerType === 'DEPENDENT' ? 'dependents' : 'users';
            const response = await actionFetchWrapper<PutMedicalProfileResponse>({
                url: HttpAPIRoutes.ADMIN_MEDICAL_PROFILES + '/' + ownerPath + '/' + id,
                method: 'PUT',
                schema: putMedicalProfileResponseSchema,
                body: JSON.stringify(data)
            });
            return response.data;
        } catch (error) {
            throw new Error(extractApiErrorMessage(error, 'Erro ao atualizar perfil médico'), { cause: error });
        }
}
