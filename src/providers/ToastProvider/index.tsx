'use client';

import { Toaster } from "react-hot-toast";

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Toaster />
            {children}
        </>
    )
}