'use server';

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

interface Props {
    user: RegisterRequest;
}

export async function postUserAction({ user }: Props) {
    const res = await actionFetchWrapper<AdminUser>({
        url: HttpAPIRoutes.REGISTER,
        method: "POST",
        body: JSON.stringify(user),
        schema: adminUserSchema
    });

    return res.data;
}