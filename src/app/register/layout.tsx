import { RegisterProvider } from '@/contexts/RegisterContext';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return (
        <RegisterProvider>
            {children}
        </RegisterProvider>
    );
}