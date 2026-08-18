import z from "zod";

export const editPersonalDataFormSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(3, {
                message:
                    "O nome deve ter pelo menos 3 caracteres",
            })
            .max(150, {
                message:
                    "O nome deve ter no máximo 150 caracteres",
            }),

        birthDate: z
            .string()
            .refine(
                (value) =>
                    value === "" ||
                    !Number.isNaN(
                        Date.parse(value),
                    ),
                {
                    message:
                        "Data de nascimento inválida",
                },
            ),

        email: z
            .string()
            .trim()
            .min(1, {
                message:
                    "O e-mail é obrigatório",
            })
            .email({
                message:
                    "Informe um e-mail válido",
            }),

        rg: z
            .string()
            .trim()
            .max(20, {
                message:
                    "O RG deve ter no máximo 20 caracteres",
            }),

        phoneNumber: z
            .string()
            .trim()
            .max(20, {
                message:
                    "O telefone deve ter no máximo 20 caracteres",
            }),

        profilePhoto: z
            .custom<FileList>()
            .optional(),
    });

export type EditPersonalDataFormData =
    z.infer<
        typeof editPersonalDataFormSchema
    >;