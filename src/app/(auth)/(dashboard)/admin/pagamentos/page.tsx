import { redirect } from "next/navigation";

export default function Page() {
    redirect("/admin/gestao-financeira?tab=movements&movement=analysis");
}
