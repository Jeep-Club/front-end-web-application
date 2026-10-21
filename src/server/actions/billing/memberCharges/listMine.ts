"use server";

import { captureAction } from "@/utils/actions/captureAction";
import { ActionError } from "@/utils/actions/actionResult";

import { memberChargeSummaryResponseSchema } from "@/schemas/billing/memberCharge";
import { pageResponseSchema } from "@/schemas/page";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage } from "@/utils/http/apiError";

async function listMyMemberChargesActionImpl(
    searchParams: MemberChargeSearchParams = {},
): Promise<PageResponse<MemberChargeSummary>> {
    const query = new URLSearchParams(
        Object.entries(searchParams).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
    );

    try {
        const response = await actionFetchWrapper({
            url: `${HttpAPIRoutes.BILLING_MY_MEMBER_CHARGES}?${query.toString()}`,
            method: "GET",
            schema: pageResponseSchema(memberChargeSummaryResponseSchema),
        });

        return response.data;
    } catch (error) {
        throw new ActionError(
            extractApiErrorMessage(error, "Erro ao carregar seu histórico financeiro"),
            { cause: error },
        );
    }
}


export async function listMyMemberChargesAction(...args: Parameters<typeof listMyMemberChargesActionImpl>) {
    return captureAction(() => listMyMemberChargesActionImpl(...args));
}
