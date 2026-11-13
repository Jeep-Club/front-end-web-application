"use client";

import { PageHeader } from "@/components/common/page-header";
import { getFinancialTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";

export function FinancialPage({ title, children }: { title: string; children: React.ReactNode }) {
    usePageTour({
        storageKey: "tour_completed_admin_financial",
        steps: getFinancialTourSteps,
        autoStartOnFirstVisit: false,
        enabled: true,
    });

    return (
        <div className="flex min-h-full w-full flex-col gap-4 p-3 pb-6 md:p-4">
            <PageHeader id="tour-financial-header" title={title} breadcrumbs={[
                { label: "Home", href: "/feed" },
                { label: "Gestão Administrativa", href: "/admin" },
                { label: title },
            ]} />
            <div id="tour-financial-content" className="flex min-w-0 flex-col gap-4">{children}</div>
        </div>
    );
}
