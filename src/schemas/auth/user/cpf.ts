import { z } from "zod";
import { isValidCPF } from "@/utils/validate/validateCPF";

/**
 * Schema Zod para validação de CPF.
 *
 * Regras:
 * - campo obrigatório
 * - deve ser um CPF válido conforme regras da Receita Federal
 *
 * Objetivo:
 * - validar CPF em formulários usando Zod
 * - integrar com react-hook-form via zodResolver
 *
 * Mensagens de erro:
 * - "O CPF precisa ser informado" — quando vazio
 * - "O CPF é inválido" — quando não passa na validação
 */
export const cpfSchema = z.string()
                        .min(1, {
                            message: "O CPF é obrigatório",
                        })
                        .refine((cpf)=> isValidCPF(cpf), {
                            message: "O CPF é inválido",
                        });

/**
 * Tipo inferido do schema de CPF.
 *
 * Uso:
 * - tipar variáveis que representam um CPF validado
 */
export type Cpf = z.infer<typeof cpfSchema>;