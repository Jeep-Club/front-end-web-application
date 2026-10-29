import PaymentsPage from "@/components/pages/admin/payments";
import { paymentStatusSchema } from "@/schemas/payments";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await searchParams;
    const status = paymentStatusSchema.safeParse(params.status);
    const page = typeof params.page === "string" ? Number(params.page) : 0;
    const size = typeof params.size === "string" ? Number(params.size) : 20;
    return <PaymentsPage filters={{
        status: status.success ? status.data : undefined,
        page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
        size: [10, 20, 50].includes(size) ? size : 20,
    }} />;
}
