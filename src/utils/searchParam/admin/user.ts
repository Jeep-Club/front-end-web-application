import { adminUserSearchParamsSchema } from "@/schemas/admin/users";

export function parseAdminUserSearchParams(
    searchParams: Record<string, string | string[] | undefined > | AdminUserSearchParams
): AdminUserSearchParams {
    const validParams: Record<string, string> = {};

    for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined) {
            continue;
        }

        // Como esperamos parâmetros simples
        const rawValue = Array.isArray(value)
            ? value[0]
            : value;

        if (rawValue === undefined || rawValue === "") {
            continue;
        }

        const result = adminUserSearchParamsSchema.shape[
            key as keyof typeof adminUserSearchParamsSchema.shape
        ]?.safeParse(rawValue);

        // Parâmetro não existe no schema
        if (!result) {
            continue;
        }

        // Parâmetro inválido
        if (!result.success) {
            continue;
        }

        validParams[key] = rawValue;
    }

    return validParams as AdminUserSearchParams;
}
