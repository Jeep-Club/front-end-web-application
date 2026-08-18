import z from "zod";

export const medicalProfileBloodTypeSchema = z.enum([
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE',
    'UNKNOWN',
]);

const optionalDescription = z.string().max(2000, 'Use no máximo 2000 caracteres');
const optionalShortText = (max: number) => z.string().max(max, `Use no máximo ${max} caracteres`);

export const medicalProfileFormSchema: z.ZodType<MedicalProfileFormData> = z.object({
    bloodType: medicalProfileBloodTypeSchema,
    allergies: optionalDescription,
    chronicConditions: optionalDescription,
    continuousMedications: optionalDescription,
    healthInsuranceProvider: optionalShortText(120),
    healthInsurancePlan: optionalShortText(120),
    healthInsuranceNumber: optionalShortText(80),
    emergencyContactName: optionalShortText(120),
    emergencyContactPhone: optionalShortText(20),
    emergencyContactRelationship: optionalShortText(80),
    observations: optionalDescription,
});

export const medicalProfileResponseSchema: z.ZodType<MedicalProfile> = z.object({
    id: z.number(),
    ownerType: z.enum(['USER', 'DEPENDENT']),
    ownerId: z.number(),
    bloodType: medicalProfileBloodTypeSchema.nullable(),
    allergies: z.string().nullable(),
    chronicConditions: z.string().nullable(),
    continuousMedications: z.string().nullable(),
    healthInsuranceProvider: z.string().nullable(),
    healthInsurancePlan: z.string().nullable(),
    healthInsuranceNumber: z.string().nullable(),
    emergencyContactName: z.string().nullable(),
    emergencyContactPhone: z.string().nullable(),
    emergencyContactRelationship: z.string().nullable(),
    observations: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
