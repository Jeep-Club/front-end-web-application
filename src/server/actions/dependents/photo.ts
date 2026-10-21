'use server';

import { z } from 'zod';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { dependentResponseSchema, relationshipSchema } from '@/schemas/dependents';
import { captureAction } from '@/utils/actions/captureAction';
import { ActionError } from '@/utils/actions/actionResult';
import { extractApiErrorMessage } from '@/utils/http/apiError';
import { imageUploadErrorMessage } from '@/utils/media/uploadError';

const payloadSchema = z.object({
    name: z.string().trim().min(3).max(150), cpf: z.string().regex(/^\d{11}$/),
    birthDate: z.string().min(1), relationshipType: relationshipSchema,
    phoneNumber: z.string().regex(/^\d{10,11}$/),
});

export async function saveDependentWithPhotoAction(form: FormData, id?: number) {
    return captureAction(async () => {
        try {
            if (id !== undefined) z.number().int().positive().parse(id);
            const raw = form.get('dependent');
            if (typeof raw !== 'string') throw new ActionError('Confira os dados do dependente.');
            const data = payloadSchema.parse(JSON.parse(raw));
            const photo = form.get('photo');
            if (!(photo instanceof File) || !photo.size) throw new ActionError('Selecione uma foto para o dependente.');
            if (photo.size > 5 * 1024 * 1024) throw new ActionError('A foto deve ter no máximo 5 MiB.');
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) throw new ActionError('Use uma foto JPEG, PNG ou WebP.');
            const body = new FormData();
            body.set('dependent', new Blob([JSON.stringify(data)], { type: 'application/json' }));
            body.set('photo', photo, photo.name);
            return (await actionFetchWrapper({ url: id ? `dependents/${id}` : 'dependents', method: id ? 'PUT' : 'POST', body, schema: dependentResponseSchema })).data;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
            const rawData = error && typeof error === 'object' && 'rawData' in error ? error.rawData : undefined;
            throw new ActionError(status ? imageUploadErrorMessage(status, rawData) : extractApiErrorMessage(error, 'Não foi possível salvar a foto do dependente. Confira os dados e tente novamente.'), { cause: error });
        }
    });
}

export async function removeDependentPhotoAction(id: number) {
    return captureAction(async () => {
        z.number().int().positive().parse(id);
        try {
            return (await actionFetchWrapper({ url: `dependents/${id}/photo`, method: 'DELETE', schema: dependentResponseSchema })).data;
        } catch (error) { throw new ActionError(extractApiErrorMessage(error, 'Não foi possível remover a foto do dependente.'), { cause: error }); }
    });
}
