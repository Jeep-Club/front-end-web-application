'use client';

import { useState } from "react";
import Sidebar from "@/components/common/layout-admin/Sidebar";
import Topbar from "@/components/common/layout-admin/Topbar";
import LegalLinks from "@/components/common/legal-links";

interface DashboardShellProps {
    fullName: string;
    children: React.ReactNode;
}


export default function DashboardShell({ fullName, children }: DashboardShellProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-j-white">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                fullName={fullName}
            />
            <div className="flex h-screen flex-1 flex-col overflow-hidden">
                <Topbar
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                    fullName={fullName}
                />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-j-gray-100">
                    <div className="flex-1">{children}</div>
                    <footer className="shrink-0 bg-j-blue-800 px-4 py-5 text-j-gray-200">
                        <LegalLinks />
                    </footer>
                </div>
            </div>
        </div>
    );
}
