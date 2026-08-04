'use client';

import { useState } from "react";
import Sidebar from "@/components/common/layout-admin/Sidebar";
import Topbar from "@/components/common/layout-admin/Topbar";
import { hasAnyAdminAccess } from "@/config/adminModules";
// TODO: nao tem nome/role reais ainda vindo do cookie Me (nem no schema), mockando por enquanto
const MOCK_FULL_NAME = "João Gabriel de Faria Beserra";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-j-white">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                fullName={MOCK_FULL_NAME}
            />
            <div className="flex h-screen flex-1 flex-col overflow-hidden">
                <Topbar
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                    fullName={MOCK_FULL_NAME}
                />
                <div className="flex-1 overflow-y-auto bg-j-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
