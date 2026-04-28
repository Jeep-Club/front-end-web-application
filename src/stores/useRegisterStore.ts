import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export interface RegisterData {
    cnh: string;
    fullName: string;
    memberSince: string;
    state: string;
    city: string;
    birthDate: string;
    nickname?: string;
    cpf: string;
    phone: string;
}

// 2. Estado e Ações
interface RegisterState {
    formData: RegisterData;
    setFormData: (data: Partial<RegisterData>) => void;
    reset: () => void;
}

export const useRegisterStore = create<RegisterState>()(
    persist(
        (set) => ({
            formData: {
                cnh: '', 
                fullName: '', 
                memberSince: '', 
                state: '',
                city: '', 
                birthDate: '', 
                cpf: '', 
                phone: '', 
                nickname: ''
            },

            
            setFormData: (data) => set((state) => ({ 
                formData: { ...state.formData, ...data } 
            })),

            reset: () => set({ 
                formData: { cnh: '', fullName: '', memberSince: '', state: '', city: '', birthDate: '', cpf: '', phone: '', nickname: '' } 
            }),
        }),
        { name: 'jeep-club-registration' } // Salva no LocalStorage
    )
);