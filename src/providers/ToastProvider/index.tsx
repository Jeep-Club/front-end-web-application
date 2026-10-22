'use client';

import { Toaster } from "react-hot-toast";

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Toaster toastOptions={{ style: { background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--gray-200)" } }} />
            {children}
        </>
    )
}