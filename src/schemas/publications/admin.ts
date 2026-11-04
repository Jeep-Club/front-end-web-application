import { z } from 'zod';
import { publicationImageSchema } from './feed';

const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const adminPublicationSchema = z.object({
    id: z.number(), title: z.string(), content: z.string(), status: statusSchema,
    images: z.array(publicationImageSchema),
});
export const adminEventSchema = adminPublicationSchema.omit({ status: true }).extend({
    publicationStatus: statusSchema,
    eventStatus: z.enum(['OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']),
});
export const pendingServiceRequestSchema = adminPublicationSchema.omit({ status: true }).extend({
    status: z.literal('PENDING'),
});
