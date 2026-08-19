'use server';

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { medicalProfileResponseSchema } from '@/schemas/profile/medical-profile';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';

export async function getMedicalProfileAction(): Promise<MedicalProfile | null> {
    try {
        const response = await actionFetchWrapper<MedicalProfile>({
            url: HttpAPIRoutes.MEDICAL_PROFILE_MEMBER,
            method: 'GET',
            schema: medicalProfileResponseSchema,
        });

        return response.data;
    } catch (error) {
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
            return null;
        }

        throw new Error(
            extractApiErrorMessage(error, 'Erro ao carregar o perfil médico'),
            { cause: error },
        );
    }
}

export async function saveMedicalProfileAction(data: MedicalProfileRequest): Promise<MedicalProfile> {
    try {
        const response = await actionFetchWrapper<MedicalProfile>({
            url: HttpAPIRoutes.MEDICAL_PROFILE_MEMBER,
            method: 'PUT',
            schema: medicalProfileResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new Error(
            extractApiErrorMessage(error, 'Erro ao salvar o perfil médico'),
            { cause: error },
        );
    }
}
