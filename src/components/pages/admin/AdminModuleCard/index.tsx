"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { InputSearch } from "@/components/common/input/input-search";
import { PageHeader } from "@/components/common/page-header";
import AdminModuleCard from "./AdminModuleCard";
import { useUserStore } from "@/stores/userStore";
import { getAvailableAdminModules } from "@/config/adminModules";
import { usePageTour } from "@/hooks/useTour";
import { getAdminPanelTourSteps } from "@/config/tourSteps";
import TourHelpButton from "@/components/common/tour/TourHelpButton";

export default function Admin() {
    const permissions = useUserStore(
        (state) => state.permissions,
    );
    const [searchQuery, setSearchQuery] = useState("");

    const availableModules = getAvailableAdminModules(permissions);
    const normalizedSearch = searchQuery
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    const filteredModules = normalizedSearch
        ? availableModules.filter(({ title, description }) => {
              const target = `${title} ${description}`
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();
              return target.includes(normalizedSearch);
          })
        : availableModules;

    // Tour do Painel de gestão (responsivo para Mobile e Desktop)
    const { restartTour } = usePageTour({
        storageKey: "tour_completed_admin_panel",
        steps: getAdminPanelTourSteps,
        autoStartOnFirstVisit: false,
        enabled: permissions.length > 0,
    });

    return (
        <div className="min-h-full w-full p-3 pb-8 md:p-4">
            <div className="flex w-full flex-col gap-6">
                <PageHeader
                    id="tour-admin-header"
                    title="Painel de gestão"
                    breadcrumbs={[
                        {
                            label: "Home",
                            href: "/feed",
                        },
                        {
                            label: "Gestão Administrativa",
                        },
                    ]}
                    actions={
                        availableModules.length > 0 ? (
                            <TourHelpButton
                                id="tour-admin-help-btn"
                                onClick={restartTour}
                                label="Como usar o painel?"
                                className="w-full justify-center sm:w-auto"
                            />
                        ) : undefined
                    }
                />

                {availableModules.length > 0 ? (
                    <>
                        <div id="tour-admin-search" className="w-full max-w-md">
                            <InputSearch
                                value={searchQuery}
                                onSubmit={setSearchQuery}
                                submitOnChange
                                label="Buscar módulo administrativo"
                                placeholder="Buscar módulo pelo nome ou descrição..."
                            />
                        </div>

                        {filteredModules.length > 0 ? (
                            <section
                                id="tour-admin-modules-grid"
                                className="
                                    grid grid-cols-1 gap-5
                                    md:grid-cols-2
                                    xl:grid-cols-3
                                "
                            >
                                {filteredModules.map(
                                    (
                                        {
                                            key,
                                            title,
                                            description,
                                            href,
                                            icon,
                                        },
                                        index,
                                    ) => (
                                        <AdminModuleCard
                                            key={key}
                                            id={`tour-admin-module-${key}`}
                                            favoriteButtonId={
                                                index === 0
                                                    ? "tour-admin-favorite-btn"
                                                    : undefined
                                            }
                                            actionId={
                                                index === 0
                                                    ? "tour-admin-manage-btn"
                                                    : undefined
                                            }
                                            moduleKey={key}
                                            title={title}
                                            description={description}
                                            href={href}
                                            icon={icon}
                                        />
                                    ),
                                )}
                            </section>
                        ) : (
                            <section
                                id="tour-admin-modules-grid"
                                className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"
                            >
                                <h2 className="text-base font-bold text-j-blue-800">
                                    Nenhum módulo encontrado
                                </h2>
                                <p className="mt-1 text-sm text-j-gray-600">
                                    Não encontramos módulos correspondentes a &ldquo;{searchQuery}&rdquo;.
                                </p>
                            </section>
                        )}
                    </>
                ) : (
                    <section
                        className="
                            flex min-h-56 flex-col items-center
                            justify-center rounded-xl border
                            border-dashed border-j-gray-300
                            bg-j-white p-6 text-center
                        "
                    >
                        <ShieldCheck
                            size={38}
                            className="mb-3 text-j-gray-400"
                        />

                        <h2 className="text-lg font-bold text-j-blue-800">
                            Nenhum módulo administrativo disponível
                        </h2>

                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            Seu usuário não possui permissão para acessar
                            funcionalidades administrativas.
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
