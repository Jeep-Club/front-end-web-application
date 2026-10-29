import { z } from "zod";

export const vehicleYearSchema = z.string()
    .regex(/^\d{4}$/, "Informe um ano com exatamente 4 dígitos.")
    .transform(Number)
    .refine((year) => year >= 1900 && year <= new Date().getFullYear(), {
        message: "Informe um ano entre 1900 e o ano atual.",
    });
