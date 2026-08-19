'use server';

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

interface Props {
    userId: number;
    status: 'enable' | 'disable';
}

export async function patchUserStatusAction({ userId, status }: Props) {
    const res = await actionFetchWrapper<AdminUser>({
        url: `${HttpAPIRoutes.ADMIN_USERS}/${userId}/${status}`,
        method: "PATCH",
        schema: adminUserSchema
    });

    return res.data;
}