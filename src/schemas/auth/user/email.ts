import { z } from "zod";
import { isValidEmail } from "@/utils/validate/validateEmail";

export const emailSchema = z.string().min(1, {
    message: "O email é obrigatório"
}).refine((value) => isValidEmail(value), {
    message: "Informe um email válido"
})