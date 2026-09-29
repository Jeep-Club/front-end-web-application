import { z } from "zod";

export const vehicleListItemSchema: z.ZodType<VehicleListItem> = z.object({
    id: z.number(),
    nickname: z.string().nullable(),
    plate: z.string(),
    photo: z.string().nullable(),
    modelYear: z.number(),
    model: z.string(),
    color: z.string(),
});

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
