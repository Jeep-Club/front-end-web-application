import { create } from 'zustand';

export interface RegisterData {
    email: string;
    cnh: string;
    fullName: string;
    memberSince: string;
    state: string;
    city: string;
    birthDate: string;
    nickname?: string;
    cpf: string;
    rg: string;
    password: string;
    phone: string;
}

interface RegisterState {
    formData: RegisterData;
    setFormData: (data: Partial<RegisterData>) => void;
    reset: () => void;
}

const initialState: RegisterData = {
    email: '',
    cnh: '',
    fullName: '',
    memberSince: '',
    state: '',
    city: '',
    birthDate: '',
    nickname: '',
    cpf: '',
    rg: '',
    password: '',
    phone: '',
};

export const useRegisterStore = create<RegisterState>()((set) => ({
    formData: initialState,
    setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
    })),
    reset: () => set({ formData: initialState }),
}));
