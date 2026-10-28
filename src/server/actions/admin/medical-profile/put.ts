'use server';

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { putMedicalProfileResponseSchema, putMedicalProfileRequestSchema } from "@/schemas/admin/medical-profile";
import { haveActionPermission } from "@/utils/permission/actionPermissions";
import { z } from "zod";
import { extractApiErrorMessage } from '@/utils/http/apiError';

interface Props {
    id: number;
    ownerType: string;
    data: PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest;
}

async function putMedicalProfileActionImpl({ id, ownerType, data }: Props) {
    try {
            if (!await haveActionPermission("HEALTH", "MEDICAL_PROFILE_UPDATE")) throw new ActionError("Acesso não permitido.");
            z.number().int().positive().parse(id);
            z.enum(['USER', 'DEPENDENT']).parse(ownerType);
            const validated = putMedicalProfileRequestSchema.parse(data);
            const ownerPath = ownerType === 'DEPENDENT' ? 'dependents' : 'users';
            const response = await actionFetchWrapper<PutMedicalProfileResponse>({
                url: HttpAPIRoutes.ADMIN_MEDICAL_PROFILES + '/' + ownerPath + '/' + id,
                method: 'PUT',
                schema: putMedicalProfileResponseSchema,
                body: JSON.stringify(validated)
            });
            return response.data;
        } catch (error) {
            throw new ActionError(extractApiErrorMessage(error, 'Erro ao atualizar perfil médico'), { cause: error });
        }
}


export async function putMedicalProfileAction(...args: Parameters<typeof putMedicalProfileActionImpl>) {
    return captureAction(() => putMedicalProfileActionImpl(...args));
}
