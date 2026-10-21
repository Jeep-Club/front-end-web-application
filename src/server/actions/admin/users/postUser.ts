'use server';

import { captureAction } from "@/utils/actions/captureAction";

import { registerResponseSchema } from "@/schemas/auth/register/registerResponse";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from '@/utils/http/api';

interface Props {
    user: RegisterRequest;
}

async function postUserActionImpl({ user }: Props) {
    const res = await actionFetchWrapper<RegisterResponse>({
        url: HttpAPIRoutes.REGISTER,
        method: "POST",
        body: JSON.stringify(user),
        schema: registerResponseSchema
    });

    return res.data;
}

export async function postUserAction(...args: Parameters<typeof postUserActionImpl>) {
    return captureAction(() => postUserActionImpl(...args));
}
