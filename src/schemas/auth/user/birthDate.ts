import { z } from "zod";
import { isValidBirthDate } from "@/utils/validate/";

export const birthDateSchema = z.string().min(1, {
    message: "Informe a data de nascimento"
}).refine((value) => isValidBirthDate(value), {
    message: "Informe uma data de nascimento válida"
}).transform(date => new Date(date).toISOString().split('T')[0]);