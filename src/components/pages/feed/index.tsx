import { PageHeader } from "@/components/common/page-header";

export default function Feed() {
    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4">
                <PageHeader
                    title="Feed"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Feed" },
                    ]}
                />

                <p>vem ai</p>
            </div>
        </div>
    );
}
