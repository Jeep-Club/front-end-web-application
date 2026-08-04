import { z } from "zod";
import { isValidRenavam } from "@/utils/validate/validateRenavam";

const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
const MAX_YEAR = new Date().getFullYear();

export const fuelTypeSchema: z.ZodType<FuelType> = z.enum([
    'GASOLINE',
    'ETHANOL',
    'FLEX',
    'DIESEL',
    'ELECTRIC',
    'HYBRID',
]);

export const includeVehicleMemberFormSchema: z.ZodType<IncludeVehicleMemberFormData> = z.object({
    nickname: z.string().max(100, { message: "O apelido deve ter no máximo 100 caracteres" }).optional(),
    photo: z.array(z.instanceof(File)).max(1, { message: "Envie apenas uma foto" }).optional(),
    plate: z.string()
        .min(1, { message: "A placa é obrigatória" })
        .transform((value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        .pipe(z.string().regex(PLATE_REGEX, { message: "Formato de placa inválido" })),
    renavam: z.string()
        .min(1, { message: "O Renavam é obrigatório" })
        .transform((value) => value.replace(/\D/g, ""))
        .pipe(z.string().refine(isValidRenavam, { message: "Renavam inválido" })),
    brand: z.string().trim().min(1, { message: "A marca é obrigatória" }).max(50, { message: "A marca deve ter no máximo 50 caracteres" }),
    model: z.string().trim().min(1, { message: "O modelo é obrigatório" }).max(50, { message: "O modelo deve ter no máximo 50 caracteres" }),
    manufacturingYear: z.string()
        .min(1, { message: "O ano de fabricação é obrigatório" })
        .transform((value) => Number(value))
        .pipe(
            z.number().int()
                .min(1900, { message: "Ano de fabricação inválido" })
                .max(MAX_YEAR, { message: "Ano de fabricação inválido" })
        ),
    modelYear: z.string()
        .min(1, { message: "O ano do modelo é obrigatório" })
        .transform((value) => Number(value))
        .pipe(
            z.number().int()
                .min(1900, { message: "Ano do modelo inválido" })
                .max(MAX_YEAR, { message: "Ano do modelo inválido" })
        ),
    color: z.string().trim().min(1, { message: "A cor é obrigatória" }).max(30, { message: "A cor deve ter no máximo 30 caracteres" }),
    seatingCapacity: z.string()
        .min(1, { message: "O nº assentos é obrigatório" })
        .transform((value) => Number(value))
        .pipe(z.number().int().min(1, { message: "O nº de assentos deve ser maior que zero" })),
    fuelType: z.string()
        .min(1, { message: "O combustível é obrigatório" })
        .transform((value) => value as FuelType),
    engineDisplacement: z.string()
        .min(1, { message: "A cilindrada é obrigatória" })
        .transform((value) => Number(value))
        .pipe(z.number().gt(0, { message: "A cilindrada deve ser maior que zero" })),
    towing: z.boolean(),
});

export const includeVehicleMemberResponseSchema = z.union([z.literal(""), z.null()]);
