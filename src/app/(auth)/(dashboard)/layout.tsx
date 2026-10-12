import { cookies } from "next/headers";
import DashboardShell from "@/components/common/layout-admin/DashboardShell";
import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const meToken = cookieStore.get("Me")?.value || '';

    const currentUser = await verifyWithSchema<MeCookie>(meToken, meCookieSchema).catch(() => null);
    const fullName = currentUser?.userName ?? "Usuário";
    const initialProfilePhotoUrl = getMediaImageUrl(currentUser?.profilePhotoStorageKey) || null;
    return (
        <DashboardShell fullName={fullName} initialProfilePhotoUrl={initialProfilePhotoUrl}>
            {children}
        </DashboardShell>
    );
}
