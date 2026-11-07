'use server';

import { putMedicalProfileResponseSchema, putMedicalProfileRequestSchema } from "@/schemas/admin/medical-profile";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

import { z } from "zod";
import { ActionError } from "@/utils/http/ActionError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

interface Props {
    id: number;
    ownerType: string;
    data: PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest;
}

export async function putMedicalProfileAction({ id, ownerType, data }: Props) {
    if (!await haveActionPermission("HEALTH", "MEDICAL_PROFILE_UPDATE")) throw new ActionError("Acesso n?o permitido.");
    z.number().int().positive().parse(id);
    z.enum(["USER", "DEPENDENT"]).parse(ownerType);
    const validated = putMedicalProfileRequestSchema.parse(data);
    const ownerPath = ownerType === 'DEPENDENT' ? 'dependents' : 'users';
    const response = await actionFetchWrapper<PutMedicalProfileResponse>({
        url: HttpAPIRoutes.ADMIN_MEDICAL_PROFILES + '/' + ownerPath + '/' + id,
        method: 'PUT',
        schema: putMedicalProfileResponseSchema,
        body: JSON.stringify(validated)
    });
    return response.data;
}
