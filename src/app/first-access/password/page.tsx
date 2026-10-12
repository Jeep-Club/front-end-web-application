import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FirstAccessPasswordPage from "@/components/pages/first-access/PasswordForm";

export default async function Page() {
    const cookieStore = await cookies();
    if (!cookieStore.get("FirstAccessPasswordChangeToken")?.value) {
        redirect("/login");
    }
    return <FirstAccessPasswordPage />;
}
