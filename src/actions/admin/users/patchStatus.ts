'use server';

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import { extractApiErrorMessage } from "@/utils/http/apiError";

interface Props {
    userId: number;
    status: 'enable' | 'disable';
}

export async function patchUserStatusAction({ userId, status }: Props) {
    try {
        const res = await actionFetchWrapper<AdminUser>({
            url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/${status}`,
            method: "PATCH",
            schema: adminUserSchema
        });

        return res.data;
    } catch (error) {
        const fallback = status === "disable"
            ? "Não foi possível desativar o usuário. Tente novamente."
            : "Não foi possível reativar o usuário. Tente novamente.";
        throw new Error(extractApiErrorMessage(error, fallback), { cause: error });
    }
}
