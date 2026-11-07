type MedicalProfileBloodType =
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
    | 'UNKNOWN';

interface MedicalProfile {
    id: number;
    ownerType: 'USER' | 'DEPENDENT';
    ownerId: number;
    bloodType: MedicalProfileBloodType | null;
    allergies: string | null;
    chronicConditions: string | null;
    continuousMedications: string | null;
    healthInsuranceProvider: string | null;
    healthInsurancePlan: string | null;
    healthInsuranceNumber: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelationship: string | null;
    observations: string | null;
    createdAt: string;
    updatedAt: string;
}

interface MedicalProfileFormData {
    bloodType: MedicalProfileBloodType;
    allergies: string;
    chronicConditions: string;
    continuousMedications: string;
    healthInsuranceProvider: string;
    healthInsurancePlan: string;
    healthInsuranceNumber: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    observations: string;
}

type MedicalProfileRequest = MedicalProfileFormData;
