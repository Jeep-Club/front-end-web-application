import { z } from "zod";

export const deleteVehicleMemberResponseSchema = z.union([z.literal(""), z.null()]);
