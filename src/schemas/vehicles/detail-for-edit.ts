import { z } from "zod";
import { fuelTypeSchema } from "./include";

export const vehicleStatusSchema: z.ZodType<VehicleStatus> = z.enum(['ACTIVE', 'INACTIVE', 'PENDING']);

export const vehicleDetailForEditResponseSchema: z.ZodType<VehicleDetailForEdit> = z.object({
    id: z.number(),
    nickname: z.string().nullable(),
    photo: z.string().nullable(),
    plate: z.string(),
    renavam: z.string(),
    brand: z.string(),
    model: z.string(),
    manufacturingYear: z.number(),
    modelYear: z.number(),
    color: z.string(),
    seatingCapacity: z.number(),
    fuelType: fuelTypeSchema,
    engineDisplacement: z.number(),
    status: vehicleStatusSchema,
    towing: z.boolean().nullable(),
    ownerId: z.number(),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    disabledAt: z.string().nullable(),
});
