import { z } from 'zod';

export const toolPhotoFields = {
    photo: z.array(z.custom<File>((value) => typeof File !== 'undefined' && value instanceof File))
        .max(1, 'Selecione apenas uma foto')
        .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), 'A foto deve ter no máximo 5 MiB')
        .refine((files) => files.every((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)), 'Use JPEG, PNG ou WebP')
        .optional(),
    removePhoto: z.boolean().optional(),
};
