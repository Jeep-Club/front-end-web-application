import { PageHeader } from "@/components/common/page-header";

export default function Financeiro() {
    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4">
                <PageHeader
                    title="Gestão financeira"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gestão financeira" },
                    ]}
                />
            </div>
        </div>
    );
}
