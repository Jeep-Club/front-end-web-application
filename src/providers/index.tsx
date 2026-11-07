'use client';
import { ThemeProvider } from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import ToastProvider from "./ToastProvider";
import { ModalProvider } from "./ModalProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
        <ToastProvider>
            <QueryProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </QueryProvider>
        </ToastProvider>
        </ThemeProvider>
    )
}