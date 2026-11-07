import { z } from "zod";
import { fuelTypeSchema, vehicleStatusSchema } from "./include";

export const vehicleDetailResponseSchema: z.ZodType<VehicleDetail> = z.object({
    id: z.number(),
    nickname: z.string().nullable(),
    photo: z.string().nullable(),
    images: z.array(z.object({ storageKey: z.string(), position: z.number().int().min(0), primary: z.boolean() })).max(5).optional(),
    galleryRevision: z.number().int().min(0).optional(),
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
    disabledAt: z.string().nullable().optional(),
}).transform((vehicle) => ({
    ...vehicle,
    photos: vehicle.images === undefined ? undefined : [...vehicle.images].sort((a, b) => a.position - b.position).map((image) => image.storageKey),
}));
