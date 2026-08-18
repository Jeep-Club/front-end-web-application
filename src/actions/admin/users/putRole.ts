'use server';

import { adminUserSchema } from "@/schemas/admin/users";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';
import z from "zod";

interface Props {
    id: number;
    roles: PutUserRoleRequest;
}

export async function putUserRoleAction({ id, roles }: Props) {
    const res = await actionFetchWrapper<null>({
        url: HttpAPIRoutes.USER_ROLES.replace('{id}', id.toString()),
        method: "PUT",
        body: JSON.stringify(roles),
        schema: z.any()
    });

    return res.data;
}