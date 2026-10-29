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

const optionalDescription = z.string().trim().max(2000);
const optionalShortText = (max: number) => z.string().trim().max(max);
const requiredShortText = (max: number) => z.string().trim().min(1, 'Campo obrigatório').max(max);

export const medicalProfileFormSchema: z.ZodType<MedicalProfileFormData> = z.object({
    bloodType: medicalProfileBloodTypeSchema.refine((value) => value !== 'UNKNOWN', 'Selecione o tipo sanguíneo'),
    allergies: optionalDescription,
    chronicConditions: optionalDescription,
    continuousMedications: optionalDescription,
    healthInsuranceProvider: optionalShortText(120),
    healthInsurancePlan: optionalShortText(120),
    healthInsuranceNumber: optionalShortText(80),
    emergencyContactName: requiredShortText(120),
    emergencyContactPhone: requiredShortText(20),
    emergencyContactRelationship: requiredShortText(80),
    observations: optionalDescription,
}).superRefine((data, context) => {
    const healthPlanFields = [data.healthInsuranceProvider, data.healthInsurancePlan, data.healthInsuranceNumber];
    const hasHealthPlan = healthPlanFields.some((value) => value.trim() !== '' && value !== 'Não se aplica');
    if (!hasHealthPlan) return;
    const names: Array<keyof MedicalProfileFormData> = ['healthInsuranceProvider', 'healthInsurancePlan', 'healthInsuranceNumber'];
    healthPlanFields.forEach((value, index) => {
        if (!value.trim() || value === 'Não se aplica') context.addIssue({ code: 'custom', path: [names[index]], message: 'Campo obrigatório quando possui plano de saúde' });
    });
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
