'use server';

import { registerResponseSchema } from "@/schemas/auth/register/registerResponse";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

interface Props {
    user: RegisterRequest;
}

export async function postUserAction({ user }: Props) {
    const res = await actionFetchWrapper<RegisterResponse>({
        url: HttpAPIRoutes.REGISTER,
        method: "POST",
        body: JSON.stringify(user),
        schema: registerResponseSchema
    });

    return res.data;
}