"use client";

import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import AdminModuleCard from "./AdminModuleCard";
import { useUserStore } from "@/stores/userStore";
import { getAvailableAdminModules } from "@/config/adminModules";

export default function Admin() {
    const permissions = useUserStore(
        (state) => state.permissions,
    );

    const availableModules =
        getAvailableAdminModules(permissions);

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-6">
                <PageHeader
                    title="Painel do Administrador"
                    breadcrumbs={[
                        {
                            label: "Início",
                            href: "/feed",
                        },
                        {
                            label: "Painel admin",
                        },
                    ]}
                />

                

                {availableModules.length > 0 ? (
                    <section
                        className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2
                            xl:grid-cols-3
                        "
                    >
                        {availableModules.map(
                            ({
                                key,
                                title,
                                description,
                                href,
                                icon,
                            }) => (
                                <AdminModuleCard
                                    key={key}
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