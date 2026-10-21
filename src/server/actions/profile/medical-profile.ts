'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { medicalProfileResponseSchema } from '@/schemas/profile/medical-profile';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { HttpAPIRoutes } from '@/utils/http/api';

async function getMedicalProfileActionImpl(): Promise<MedicalProfile | null> {
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

        throw new ActionError(
            extractApiErrorMessage(error, 'Erro ao carregar o perfil médico'),
            { cause: error },
        );
    }
}

async function saveMedicalProfileActionImpl(data: MedicalProfileRequest): Promise<MedicalProfile> {
    try {
        const response = await actionFetchWrapper<MedicalProfile>({
            url: HttpAPIRoutes.MEDICAL_PROFILE_MEMBER,
            method: 'PUT',
            schema: medicalProfileResponseSchema,
            body: JSON.stringify(data),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, 'Erro ao salvar o perfil médico'),
            { cause: error },
        );
    }
}


export async function getMedicalProfileAction(...args: Parameters<typeof getMedicalProfileActionImpl>) {
    return captureAction(() => getMedicalProfileActionImpl(...args));
}


export async function saveMedicalProfileAction(...args: Parameters<typeof saveMedicalProfileActionImpl>) {
    return captureAction(() => saveMedicalProfileActionImpl(...args));
}
