interface RegisterFormData {
    cnh: string;
    fullName: string;
    memberSince: string;
    state: string;
    city: string;
    birthDate: string;
    nickname?: string;
    cpf: string;
    phone: string;
}

interface RegisterRequest {
    name: string;
    birthData: string;
    email: string;
    cpf: string;
    rg: string;
    password: string;
    phoneNumber: string;
}

interface RegisterResponse {
  refreshToken: string,
  accessToken: string,
  expiresInSeconds: number
}

/* ======================================================
  MÓDULO FUTURO 
======================================================
export interface RegisterStep2Data {
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    hasAllergy: boolean;
    allergyDescription?: string;
    hasChronicDisease: boolean;
    chronicDiseaseDescription?: string;
    takesMedication: boolean;
    medicationDescription?: string;
    emergencyContact: string;
    hasHealthPlan: boolean;
}
*/