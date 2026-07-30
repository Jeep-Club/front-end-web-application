type BloodType = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE' | string;

type GetListMedicalProfilesResponse = {
  id: number;
  ownerType: string;
  ownerId: number;
  bloodType: BloodType;
  updatedAt: string;
}[]

interface GetMedicalProfileResponse {
  id: number;
  ownerType: string;
  ownerId: number;
  bloodType: string; 
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
  createdAt: string;
  updatedAt: string;
};
interface PutMedicalProfile {
  bloodType: BloodType;
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

type PutMedicalProfileUserRequest = PutMedicalProfile;

type PutMedicalProfileDependentRequest = PutMedicalProfile;

type PutMedicalProfileResponse = GetMedicalProfileResponse;

type PutMedicalProfileUserResponse = PutMedicalProfileResponse;

type PutMedicalProfileDependentResponse = PutMedicalProfileResponse;
