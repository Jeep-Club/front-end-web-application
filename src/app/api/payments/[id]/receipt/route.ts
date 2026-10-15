import { z } from "zod";
import actionFetchWrapper from "@/services/fetchWrapper/actionFetchWrapper";
import { paymentPermissions } from "@/config/paymentPermissions";
import { paymentIdSchema } from "@/schemas/payments";
import { HttpAPIRoutes } from "@/utils/http/api";
import { extractApiErrorMessage, SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";
import { haveActionPermission } from "@/utils/permission/actionPermissions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!paymentIdSchema.safeParse(Number(id)).success) {
        return Response.json({ message: "Pagamento inválido." }, { status: 400 });
    }
    try {
        if (!await haveActionPermission(paymentPermissions.module, paymentPermissions.read)) {
            return Response.json({ message: "Você não possui permissão para consultar comprovantes." }, { status: 403 });
        }
    } catch {
        return Response.json({ message: SESSION_EXPIRED_MESSAGE }, { status: 401 });
    }
    try {
        const { data } = await actionFetchWrapper({
            url: `${HttpAPIRoutes.BILLING_PAYMENTS}/${Number(id)}/receipt`,
            method: "GET",
            cache: "no-store",
            responseType: "blob",
            schema: z.instanceof(Blob),
        });
        if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(data.type)) {
            return Response.json({ message: "Formato de comprovante não suportado." }, { status: 502 });
        }
        return new Response(data, { headers: {
            "Content-Type": data.type,
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        } });
    } catch (error) {
        const message = extractApiErrorMessage(error, "Não foi possível carregar o comprovante.");
        const status = message === SESSION_EXPIRED_MESSAGE ? 401
            : error && typeof error === "object" && "status" in error && typeof error.status === "number" ? error.status : 502;
        return Response.json({ message }, { status });
    }
}
