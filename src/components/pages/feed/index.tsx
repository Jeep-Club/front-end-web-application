import { PageHeader } from "@/components/common/page-header";

export default function Feed() {
    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4">
                <PageHeader
                    title="Home"
                    breadcrumbs={[
                        { label: "Home" },
                    ]}
                />

                <p>vem ai</p>
            </div>
        </div>
    );
}
