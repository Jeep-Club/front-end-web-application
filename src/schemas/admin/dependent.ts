import { z } from 'zod';

const dependentMedicalProfileSchema: z.ZodType<DependentMedicalProfile> = z.object({
    bloodType: z.string().nullable(),
    allergies: z.string().nullable(),
    chronicDiseases: z.string().nullable(),
    medications: z.string().nullable(),
    medicalNotes: z.string().nullable(),
});

const dependentSchema: z.ZodType<Dependent> = z.object({
    id: z.number(),
    name: z.string(),
    cpf: z.string(),
    birthDate: z.string(),
    relationshipType: z.enum([
        'CHILD',
        'GUEST',
        'OTHER',
        'PARENT',
        'SIBLING',
        'SPOUSE',
    ]),
    phoneNumber: z.string(),
    medicalProfile: dependentMedicalProfileSchema,
    consentAccepted: z.boolean(),
    consentAcceptedAt: z.string(),
    socioId: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const getAllDependentsResponseSchema: z.ZodType<GetListDependentsResponse> = z.array(dependentSchema);

export const adminDependentRelationshipSchema = z.enum([
    'CHILD',
    'GUEST',
    'OTHER',
    'PARENT',
    'SIBLING',
    'SPOUSE',
]);

export const adminDependentStatusSchema = z.enum([
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED',
]);

export const adminDependentItemSchema: z.ZodType<AdminDependentItem> = z.object({
    id: z.number(),
    name: z.string(),
    cpf: z.string(),
    birthDate: z.string(),
    relationshipType: adminDependentRelationshipSchema,
    phoneNumber: z.string().nullable(),
    userId: z.number(),
    ownerName: z.string().nullable().optional(),
    status: adminDependentStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    archivedAt: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
});

export const adminDependentsByUserResponseSchema = z.array(adminDependentItemSchema);

export const listAdminDependentsResponseSchema: z.ZodType<ListAdminDependentsResponse> = z.object({
    content: z.array(adminDependentItemSchema),
    number: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    numberOfElements: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
});
