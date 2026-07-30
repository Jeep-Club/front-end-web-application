'use server';

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { putMedicalProfileResponseSchema } from "@/schemas/admin/medical-profile";

interface Props {
    id: number;
    data: PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest;
}

export async function putMedicalProfileAction({ id, data }: Props) {
    try {
            const response = await actionFetchWrapper<PutMedicalProfileResponse>({
                url: `${HttpAPIRoutes.ADMIN_MEDICAL_PROFILES}/users/${id}`,
                method: 'PUT',
                schema: putMedicalProfileResponseSchema,
                body: JSON.stringify(data)
            });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao atualizar perfil médico', { cause: error });
        }
}