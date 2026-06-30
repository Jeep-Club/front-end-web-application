import z from "zod";

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'UNKNOWN'
}

export const getAllMedicalProfilesResponseSchema: z.ZodType<GetListMedicalProfilesResponse> = z.array(
  z.object({
    id: z.number(),
    ownerType: z.string(),
    ownerId: z.number(),
    bloodType: z.string(),
    updatedAt: z.string(),
  })
);

export const getMedicalProfileResponseSchema: z.ZodType<GetMedicalProfileResponse> = z.object({
  id: z.number(),
  ownerType: z.string(),
  ownerId: z.number(),
  bloodType: z.string(),
  allergies: z.string(),
  chronicConditions: z.string(),
  continuousMedications: z.string(),
  healthInsuranceProvider: z.string(),
  healthInsurancePlan: z.string(),
  healthInsuranceNumber: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelationship: z.string(),
  observations: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const putMedicalProfileRequestSchema: z.ZodType<PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest> = z.object({
  bloodType: z.string(),
  allergies: z.string(),
  chronicConditions: z.string(),
  continuousMedications: z.string(),
  healthInsuranceProvider: z.string(),
  healthInsurancePlan: z.string(),
  healthInsuranceNumber: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelationship: z.string(),
  observations: z.string(),
});

export const putMedicalProfileResponseSchema: z.ZodType<PutMedicalProfileResponse> = getMedicalProfileResponseSchema;