import { notFound } from "next/navigation";
import { getPublicationAction } from "@/actions/admin/publications/get";
import { PageHeader } from "@/components/common/page-header";
import { PublicationForm } from "@/components/pages/admin/publications/PublicationForm";

function parseId(value: string): bigint | null { if (!/^\d+$/.test(value)) return null; const id = BigInt(value); return id > BigInt(0) ? id : null; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const id = parseId((await params).id); if (!id) notFound();
    const publication = await getPublicationAction(id).catch(() => null); if (!publication) notFound();
    return <div className="min-h-full w-full p-3 md:p-4"><div className="mx-auto flex max-w-5xl flex-col gap-5 pb-8"><PageHeader title="Editar publicação" breadcrumbs={[{ label: "Início", href: "/feed" }, { label: "Gestão Administrativa", href: "/admin" }, { label: "Publicações", href: "/admin/publications" }, { label: "Editar" }]} /><PublicationForm publication={publication} /></div></div>;
}
