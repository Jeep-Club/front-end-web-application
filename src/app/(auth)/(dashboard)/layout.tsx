import { cookies } from "next/headers";
import DashboardShell from "@/components/common/layout-admin/DashboardShell";
import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const meToken = cookieStore.get("Me")?.value || '';

    const currentUser = await verifyWithSchema<MeCookie>(meToken, meCookieSchema).catch(() => null);
    const onboardingUserId = cookieStore.get("FirstAccessOnboardingUserId")?.value;
    const onboardingRequired = Boolean(currentUser && onboardingUserId === String(currentUser.userId));
    const fullName = currentUser?.userName ?? "Usuário";
    const initialProfilePhotoUrl = getMediaImageUrl(currentUser?.profilePhotoStorageKey) || null;
    return (
        <DashboardShell fullName={fullName} userId={currentUser?.userId ?? "unknown"} initialProfilePhotoUrl={initialProfilePhotoUrl} onboardingRequired={onboardingRequired}>
            {children}
        </DashboardShell>
    );
}
