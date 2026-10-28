import { z } from "zod";
import { isValidBirthDate } from "@/utils/validate/validateBirthDate";

export const birthDateSchema = z.string().min(1, {
    message: "Informe a data de nascimento"
}).refine((value) => isValidBirthDate(value), {
    message: "Informe uma data de nascimento válida, entre 1900 e o ano atual, sem data futura."
});