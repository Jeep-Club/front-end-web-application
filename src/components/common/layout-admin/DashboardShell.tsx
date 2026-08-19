'use client';

import { useState } from "react";
import Sidebar from "@/components/common/layout-admin/Sidebar";
import Topbar from "@/components/common/layout-admin/Topbar";
import GuidedTour from "@/components/common/tour/GuidedTour";

interface DashboardShellProps {
    fullName: string;
    children: React.ReactNode;
}

export default function DashboardShell({ fullName, children }: DashboardShellProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <GuidedTour setMobileMenuOpen={setIsMobileMenuOpen}>
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
                    <div className="flex-1 overflow-y-auto bg-j-gray-100">
                        {children}
                    </div>
                </div>
            </div>
        </GuidedTour>
    );
}
