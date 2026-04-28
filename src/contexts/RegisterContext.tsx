'use client';

import { createContext, useContext, useState } from 'react';

interface RegisterStep1Data {
    cnh: string;
    fullName: string;
    memberSince: string;
    state: string;
    city: string;
    birthDate: string;
    nickname?: string;
    cpf: string;
    phone: string;
    email: string;
    name: string;
}
//Janaina Venancio

// Mantidos para uso futuro quando o back mapear
// interface RegisterStep2Data { ... }
// interface RegisterFormData extends RegisterStep1Data, RegisterStep2Data {}

interface RegisterContextType {
    step1Data: RegisterStep1Data;
    setStep1Data: (data: RegisterStep1Data) => void;
}

const RegisterContext = createContext<RegisterContextType | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
    const [step1Data, setStep1Data] = useState<RegisterStep1Data>({
        name: '',
        cnh: '',
        fullName: '',
        memberSince: '',
        state: '',
        city: '',
        birthDate: '',
        nickname: '',
        cpf: '',
        phone: '',
        email: '',
    });

    return (
        <RegisterContext.Provider value={{ step1Data, setStep1Data }}>
            {children}
        </RegisterContext.Provider>
    );
}

export function useRegisterContext() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error('useRegisterContext deve ser usado dentro de RegisterProvider');
    }
    return context;
}