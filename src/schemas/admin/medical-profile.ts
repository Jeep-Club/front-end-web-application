import z from "zod";
import { pageResponseSchema } from '../page';

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

const medicalProfileSummarySchema: z.ZodType<MedicalProfileSummary> = z.object({
    id: z.number(),
    ownerType: z.string(),
    ownerId: z.number(),
    updatedAt: z.string(),
});

export const getAllMedicalProfilesResponseSchema = pageResponseSchema(medicalProfileSummarySchema);

export const getMedicalProfileResponseSchema: z.ZodType<GetMedicalProfileResponse> = z.object({
  id: z.number(),
  ownerType: z.string(),
  ownerId: z.number(),
  bloodType: z.string(),
  allergies: z.string().nullish().transform(value => value ?? ''),
  chronicConditions: z.string().nullish().transform(value => value ?? ''),
  continuousMedications: z.string().nullish().transform(value => value ?? ''),
  healthInsuranceProvider: z.string().nullish().transform(value => value ?? ''),
  healthInsurancePlan: z.string().nullish().transform(value => value ?? ''),
  healthInsuranceNumber: z.string().nullish().transform(value => value ?? ''),
  emergencyContactName: z.string().nullish().transform(value => value ?? ''),
  emergencyContactPhone: z.string().nullish().transform(value => value ?? ''),
  emergencyContactRelationship: z.string().nullish().transform(value => value ?? ''),
  observations: z.string().nullish().transform(value => value ?? ''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const putMedicalProfileRequestSchema: z.ZodType<PutMedicalProfileUserRequest | PutMedicalProfileDependentRequest> = z.object({
  bloodType: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN']),
  allergies: z.string().trim().max(2000),
  chronicConditions: z.string().trim().max(2000),
  continuousMedications: z.string().trim().max(2000),
  healthInsuranceProvider: z.string().trim().max(120),
  healthInsurancePlan: z.string().trim().max(120),
  healthInsuranceNumber: z.string().trim().max(80),
  emergencyContactName: z.string().trim().max(120),
  emergencyContactPhone: z.string().trim().max(30).refine(value => !value || /^\d{10,11}$/.test(value.replace(/\D/g, '')), 'Informe um telefone com DDD e 10 ou 11 digitos'),
  emergencyContactRelationship: z.string().trim().max(80),
  observations: z.string().trim().max(2000),
});

export const putMedicalProfileResponseSchema: z.ZodType<PutMedicalProfileResponse> = z.object({
  id: z.number(),
  ownerType: z.string(),
  ownerId: z.number(),
  updatedAt: z.string(),
});
