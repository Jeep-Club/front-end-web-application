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

const requiredDescription = z.string().trim().min(1, 'Campo obrigatório').max(2000);
const requiredShortText = (max: number) => z.string().trim().min(1, 'Campo obrigatório').max(max);

export const medicalProfileFormSchema: z.ZodType<MedicalProfileFormData> = z.object({
    bloodType: medicalProfileBloodTypeSchema.refine((value) => value !== 'UNKNOWN', 'Selecione o tipo sanguineo'),
    allergies: requiredDescription,
    chronicConditions: requiredDescription,
    continuousMedications: requiredDescription,
    healthInsuranceProvider: requiredShortText(120),
    healthInsurancePlan: requiredShortText(120),
    healthInsuranceNumber: requiredShortText(80),
    emergencyContactName: requiredShortText(120),
    emergencyContactPhone: requiredShortText(20),
    emergencyContactRelationship: requiredShortText(80),
    observations: requiredDescription,
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
