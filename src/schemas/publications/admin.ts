import { z } from 'zod';
import { eventRegistrationSchema } from './event-registration';
import { publicationInstantSchema } from './feed';
import { publicationEditorialFields, eventChargesSchema } from './create';

export const publicationIdSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const statusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const adminPublicationSchema = z.object({
    id: publicationIdSchema, authorUserId: publicationIdSchema, ...publicationEditorialFields, content: z.string(), status: statusSchema,
});
export const adminEventSchema = adminPublicationSchema.omit({ status: true }).extend({
    publicationStatus: statusSchema,
    eventStatus: z.enum(['OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']),
    startsAt: publicationInstantSchema, endsAt: publicationInstantSchema.nullable(),
});
const timestamps = { createdAt: publicationInstantSchema, updatedAt: publicationInstantSchema, publishedAt: publicationInstantSchema.nullable(), archivedAt: publicationInstantSchema.nullable() };
export const adminNoticeSchema = adminPublicationSchema.extend(timestamps);
export const adminServiceSchema = adminNoticeSchema.extend({ sourceRequestId: publicationIdSchema, amount: z.number().positive(), contactPhone: z.string() });
export const noticeUpdateSchema = z.object(publicationEditorialFields).partial().strict();
export const eventUpdateSchema = noticeUpdateSchema.extend({ charges: eventChargesSchema.optional(), startsAt: publicationInstantSchema.optional(), endsAt: publicationInstantSchema.nullable().optional() });
export type AdminEvent = z.infer<typeof adminEventSchema>;
export type AdminNotice = z.infer<typeof adminNoticeSchema>;
export type AdminService = z.infer<typeof adminServiceSchema>;
export const pendingServiceRequestSchema = adminPublicationSchema.omit({ status: true }).extend({
    status: z.literal('PENDING'),
});

export const eventChargeCatalogSchema = z.object({ id: publicationIdSchema, name: z.string(), description: z.string().nullable(), defaultAmount: z.number(), required: z.boolean(), paymentAcceptancePolicy: z.string() });
export const eventChargeRuleSchema = z.object({ eventId: publicationIdSchema, chargeDefinitionId: publicationIdSchema, requiredForParticipation: z.boolean(), participationCutoff: publicationInstantSchema, financialDueDate: z.iso.date().nullable() });
export type EventChargeRule = z.infer<typeof eventChargeRuleSchema>;

const count = z.number().int().nonnegative();
export const adminEventDashboardSchema = z.object({
    registrations: z.array(eventRegistrationSchema), dependents: count, guestsPending: count, guestsApproved: count, totalPeople: count, vehicles: count, totalCapacity: count, availableSeats: z.number().int(), unpaidCharges: count, pendingValidation: count, postCutoffPending: count, guestsStandby: count, guestsAllocated: count, guestsCancelled: count,
    financial: z.array(z.object({ chargeDefinitionId: publicationIdSchema.nullable(), userId: publicationIdSchema.nullable(), memberChargeId: publicationIdSchema.nullable(), effectiveStatus: z.string().nullable(), paymentStatus: z.string().nullable(), paymentSubmittedAt: publicationInstantSchema.nullable(), definitionName: z.string().nullable(), amount: z.number().nullable(), chargeCycleId: publicationIdSchema.nullable(), dueDate: z.iso.date().nullable() })),
});
export type AdminEventDashboard = z.infer<typeof adminEventDashboardSchema>;
