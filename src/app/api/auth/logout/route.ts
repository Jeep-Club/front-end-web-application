import { logout } from '@/utils/auth/logout';
import { redirect } from "next/navigation";

export async function GET() {
    await logout();
    redirect('/');
}