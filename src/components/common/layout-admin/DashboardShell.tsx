'use client';

import { useState } from "react";
import Sidebar from "@/components/common/layout-admin/Sidebar";
import Topbar from "@/components/common/layout-admin/Topbar";
import DashboardFooter from "@/components/common/layout-admin/DashboardFooter";
import GuidedTour from "@/components/common/tour/GuidedTour";
import { FirstAccessOnboarding } from "@/components/pages/first-access/Onboarding";
import { AdminUserIdContext } from "@/hooks/useAdminFavorites";

interface DashboardShellProps {
    fullName: string;
    userId: string | number;
    initialProfilePhotoUrl?: string | null;
    onboardingRequired?: boolean;
    children: React.ReactNode;
}

export default function DashboardShell({ fullName, userId, initialProfilePhotoUrl, onboardingRequired = false, children }: DashboardShellProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (onboardingRequired) return <FirstAccessOnboarding />;

    return (
        <GuidedTour setMobileMenuOpen={setIsMobileMenuOpen}>
            <AdminUserIdContext.Provider value={userId}>
            <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-j-white">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isMobileOpen={isMobileMenuOpen}
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                    fullName={fullName}
                    userId={userId}
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <Topbar
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                        fullName={fullName}
                        initialProfilePhotoUrl={initialProfilePhotoUrl}
                    />
                    <div data-dashboard-scroll className="isolate min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-j-gray-100 [-webkit-overflow-scrolling:touch]">
                        {children}
                    </div>
                    <DashboardFooter />
                </div>
            </div>
            </AdminUserIdContext.Provider>
        </GuidedTour>
    );
}
