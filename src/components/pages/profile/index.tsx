'use client';

import { useState } from "react";
import { IdCard, HeartPulse, Users, Car, Wrench } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { PageHeader } from "@/components/common/page-header";
import { VehiclesTabContent } from "@/components/pages/profile/tabs/vehicles/VehiclesTabContent";
import { PersonalDataTab } from "@/components/pages/profile/tabs/personal/PersonalDataTab";
import { MedicalProfileTab } from "@/components/pages/profile/tabs/medical/MedicalProfileTab";

const TABS = [
    { key: "personal", label: "Dados pessoais", icon: IdCard, content: "dados pessoal" },
    { key: "medical", label: "Dados médicos", icon: HeartPulse, content: "dados médicos" },
    { key: "dependents", label: "Dependentes", icon: Users, content: "dependentes" },
    { key: "vehicles", label: "Veículos", icon: Car, content: "veículos" },
    { key: "tools", label: "Ferramentas", icon: Wrench, content: "ferramentas" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function Profile() {
    const [activeTab, setActiveTab] = useState<TabKey>("personal");

    const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;
    const activeContent = TABS.find((tab) => tab.key === activeTab)?.content;

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-5">
                <PageHeader
                    title="Gerenciamento de conta"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gerenciamento de conta" },
                        { label: activeTabLabel ?? "" },
                    ]}
                />

                <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {TABS.map(({ key, label, icon: Icon }) => {
                        const isActive = key === activeTab;
                        return (
                            <button
                                key={key}
                                type="button"
                                title={label}
                                onClick={() => setActiveTab(key)}
                                className={twMerge(
                                    "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-2 text-center transition-colors md:p-4",
                                    isActive
                                        ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-md"
                                        : "border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-blue-300 hover:text-j-blue-800"
                                )}
                            >
                                <Icon size={22} />
                                <span className="hidden text-xs font-bold md:inline">{label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex min-h-40 flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-3 shadow-sm sm:p-4 lg:p-6">
                    {activeTab === "personal" ? (
                        <PersonalDataTab />
                    ) : activeTab === "medical" ? (
                        <MedicalProfileTab />
                    ) : activeTab === "vehicles" ? (
                        <VehiclesTabContent />
                    ) : (
                        <p>{activeContent}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
