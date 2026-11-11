"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/button";
import { getAdminCardReportContextAction } from "@/server/actions/admin/membership/card-report";
import { downloadAdminMemberReport } from "@/utils/card-export/adminMemberReport";

export function AdminMemberReportExport({ user }: { user: AdminUser }) {
    const [pending, setPending] = useState(false);

    async function exportReport() {
        if (pending) return;
        setPending(true);
        try {
            const context = await getAdminCardReportContextAction(user.id);
            await downloadAdminMemberReport({ ...user, membershipNumber: context.membershipNumber, membershipCreatedAt: context.membershipCreatedAt, profile: context.profile }, context.exportedBy);
            toast.success("Ficha do associado exportada.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível gerar a ficha do associado.");
        } finally {
            setPending(false);
        }
    }

    return <Button type="button" onClick={() => void exportReport()} isLoading={pending} className="shrink-0 gap-2 bg-j-yellow-300 px-3 py-2 text-xs text-j-blue-900 hover:bg-j-yellow-200 sm:text-sm">
        {pending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
        {pending ? "Gerando ficha…" : "Exportar ficha PDF"}
    </Button>;
}
