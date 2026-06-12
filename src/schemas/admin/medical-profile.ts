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