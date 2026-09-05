import { PageHeader } from "@/components/common/page-header";
import { PublicationForm } from "@/components/pages/admin/publications/PublicationForm";
export default function Page() {
    return <div className="min-h-full w-full p-3 md:p-4"><div className="mx-auto flex max-w-5xl flex-col gap-5 pb-8"><PageHeader title="Nova publicação" breadcrumbs={[{ label: "Início", href: "/feed" }, { label: "Gestão Administrativa", href: "/admin" }, { label: "Publicações", href: "/admin/publications" }, { label: "Nova" }]} /><PublicationForm /></div></div>;
}

