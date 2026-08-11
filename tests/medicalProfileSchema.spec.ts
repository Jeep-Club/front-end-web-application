import {
    medicalProfileFormSchema,
    medicalProfileResponseSchema,
} from '@/schemas/profile/medical-profile';

const validFormData = {
    bloodType: 'O_POSITIVE' as const,
    allergies: 'Dipirona',
    chronicConditions: 'Asma',
    continuousMedications: 'Losartana 50mg',
    healthInsuranceProvider: 'Unimed',
    healthInsurancePlan: 'Nacional',
    healthInsuranceNumber: '123456789',
    emergencyContactName: 'Maria da Silva',
    emergencyContactPhone: '(12) 99999-9999',
    emergencyContactRelationship: 'Mãe',
    observations: 'Procurar atendimento em caso de crise.',
};

describe('medicalProfileFormSchema', () => {
    it('aceita um perfil médico válido', () => {
        const result = medicalProfileFormSchema.safeParse(validFormData);

        expect(result.success).toBe(true);
    });

    it('aceita todos os campos opcionais vazios', () => {
        const result = medicalProfileFormSchema.safeParse({
            ...validFormData,
            bloodType: 'UNKNOWN',
            allergies: '',
            chronicConditions: '',
            continuousMedications: '',
            healthInsuranceProvider: '',
            healthInsurancePlan: '',
            healthInsuranceNumber: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
            observations: '',
        });

        expect(result.success).toBe(true);
    });

    it('rejeita um tipo sanguíneo inválido', () => {
        const result = medicalProfileFormSchema.safeParse({
            ...validFormData,
            bloodType: 'X_POSITIVE',
        });

        expect(result.success).toBe(false);
    });

    it.each([
        ['allergies', 2001],
        ['chronicConditions', 2001],
        ['continuousMedications', 2001],
        ['observations', 2001],
        ['healthInsuranceProvider', 121],
        ['healthInsurancePlan', 121],
        ['healthInsuranceNumber', 81],
        ['emergencyContactName', 121],
        ['emergencyContactPhone', 21],
        ['emergencyContactRelationship', 81],
    ])('rejeita o campo %s acima do limite', (field, length) => {
        const result = medicalProfileFormSchema.safeParse({
            ...validFormData,
            [field]: 'a'.repeat(length),
        });

        expect(result.success).toBe(false);
    });
});

describe('medicalProfileResponseSchema', () => {
    it('aceita campos opcionais nulos retornados pela API', () => {
        const result = medicalProfileResponseSchema.safeParse({
            id: 1,
            ownerType: 'USER',
            ownerId: 10,
            bloodType: null,
            allergies: null,
            chronicConditions: null,
            continuousMedications: null,
            healthInsuranceProvider: null,
            healthInsurancePlan: null,
            healthInsuranceNumber: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            emergencyContactRelationship: null,
            observations: null,
            createdAt: '2026-08-08T12:00:00Z',
            updatedAt: '2026-08-08T12:00:00Z',
        });

        expect(result.success).toBe(true);
    });
});
