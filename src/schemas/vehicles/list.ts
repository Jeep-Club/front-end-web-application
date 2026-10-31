import { z } from "zod";
import { vehicleStatusSchema } from './include';

export const vehicleListItemSchema: z.ZodType<VehicleListItem> = z.object({
    id: z.number(),
    nickname: z.string().nullable(),
    plate: z.string(),
    photo: z.string().nullable(),
    images: z.array(z.object({ storageKey: z.string(), position: z.number().int().min(0), primary: z.boolean() })).max(5).optional(),
    galleryRevision: z.number().int().min(0).optional(),
    modelYear: z.number(),
    model: z.string(),
    color: z.string(),
    status: vehicleStatusSchema,
    ownerId: z.number().nullable().optional(),
    ownerName: z.string().nullable().optional(),
}).transform((vehicle) => ({
    ...vehicle,
    photos: vehicle.images === undefined ? undefined : [...vehicle.images].sort((a, b) => a.position - b.position).map((image) => image.storageKey),
}));

export const listVehicleMemberResponseSchema: z.ZodType<ListVehicleMemberResponse> = z.object({
    content: z.array(vehicleListItemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    numberOfElements: z.number(),
    empty: z.boolean(),
});
