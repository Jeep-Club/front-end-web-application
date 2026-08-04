import { cookies } from "next/headers";
import DashboardShell from "@/components/common/layout-admin/DashboardShell";
import { meCookieSchema } from "@/schemas/auth/me/me";
import { verifyWithSchema } from "@/services/token/verify";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const meToken = cookieStore.get("Me")?.value || '';

    const fullName = await verifyWithSchema<MeCookie>(meToken, meCookieSchema)
        .then((me) => me.userName)
        .catch(() => "Usuário");

    return (
        <DashboardShell fullName={fullName}>
            {children}
        </DashboardShell>
    );
}
