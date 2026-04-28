'use client';

import { createContext, useContext, useState } from 'react';

interface RegisterContextType {
    step1Data: RegisterStep1Data;
    step2Data: RegisterStep2Data;
    setStep1Data: (data: RegisterStep1Data) => void;
    setStep2Data: (data: RegisterStep2Data) => void;
}

const RegisterContext = createContext<RegisterContextType | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
    const [step1Data, setStep1Data] = useState<RegisterStep1Data>({
        cnh: '',
        fullName: '',
        memberSince: '',
        state: '',
        city: '',
        birthDate: '',
        nickname: '',
        cpf: '',
        phone: '',
    });

    const [step2Data, setStep2Data] = useState<RegisterStep2Data>({
        bloodType: 'O+',
        hasAllergy: false,
        allergyDescription: '',
        hasChronicDisease: false,
        chronicDiseaseDescription: '',
        takesMedication: false,
        medicationDescription: '',
        emergencyContact: '',
        hasHealthPlan: false,
    });

    return (
        <RegisterContext.Provider value={{ step1Data, step2Data, setStep1Data, setStep2Data }}>
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