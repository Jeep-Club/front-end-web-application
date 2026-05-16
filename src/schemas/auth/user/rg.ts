import { z } from "zod";
import { isValidRG } from "@/utils/validate";

export const rgSchema = z.string()
  .min(7, "O RG deve conter no mínimo 7 caracteres.")
  .max(12, "O RG deve conter no máximo 12 caracteres (incluindo pontos e hífen).")
  .refine((value) => isValidRG(value), {
    message: "O RG informado é inválido.",
  });