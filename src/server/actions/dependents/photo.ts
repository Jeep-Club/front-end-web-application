'use server';

import { birthDateSchema } from '@/schemas/auth/user/birthDate';
import { dependentResponseSchema,relationshipSchema } from '@/schemas/dependents';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { ActionError } from '@/utils/http/ActionError';
import { z } from 'zod';

const payloadSchema = z.object({
    name: z.string().trim().min(3).max(150), cpf: z.string().regex(/^\d{11}$/),
    birthDate: birthDateSchema, relationshipType: relationshipSchema,
    phoneNumber: z.string().regex(/^\d{10,11}$/),
});

export async function saveDependentWithPhotoAction(form: FormData, id?: number) {
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
    }

export async function removeDependentPhotoAction(id: number) {
        z.number().int().positive().parse(id);
        return (await actionFetchWrapper({ url: `dependents/${id}/photo`, method: 'DELETE', schema: dependentResponseSchema })).data;
    }
