import { notFound } from "next/navigation";
import PaymentDetailPage from "@/components/pages/admin/payments/PaymentDetailPage";
import { paymentIdSchema } from "@/schemas/payments";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = paymentIdSchema.safeParse(Number(id));
    if (!result.success) notFound();
    return <PaymentDetailPage key={result.data} id={result.data} />;
}
