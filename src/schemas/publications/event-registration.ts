import { z } from 'zod';

const id = z.number().int().positive();
export const eventRegistrationSchema = z.object({
    id, eventId: id, userId: id,
    status: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED']),
    allocations: z.array(z.object({ vehicleId: id, member: z.boolean(), dependentIds: z.array(id) })),
    createdAt: z.string(), confirmedAt: z.string().nullable(), cancelledAt: z.string().nullable(),
    unallocatedDependentIds: z.array(id),
});
