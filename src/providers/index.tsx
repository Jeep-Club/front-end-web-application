'use client';
import QueryProvider from "./QueryProvider";
import ToastProvider from "./ToastProvider";
import { ModalProvider } from "./ModalProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <QueryProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </QueryProvider>
        </ToastProvider>
    )
}