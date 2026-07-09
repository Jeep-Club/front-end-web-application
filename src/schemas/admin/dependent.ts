import { z } from 'zod';

const dependentMedicalProfileSchema: z.ZodType<DependentMedicalProfile> = z.object({
    bloodType: z.string().nullable(),
    allergies: z.string().nullable(),
    chronicDiseases: z.string().nullable(),
    medications: z.string().nullable(),
    medicalNotes: z.string().nullable(),
})

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
})

export const getAllDependentsResponseSchema: z.ZodType<GetListDependentsResponse> = z.array(dependentSchema);
