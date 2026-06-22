import FormForgotPassword from "@/components/pages/forgot-password/form";

export default function ForgotPasswordPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <FormForgotPassword />
            </div>
        </main>
    );
}