// app/register/page.tsx
import Step1Form from '@/components/pages/register/Index';
export const metadata = {
    title: 'Novo Membro | Jeep Club Tamoios',
    description: 'Cadastre-se no Jeep Club Tamoios',
};

export default function RegisterPage() {
    return <Step1Form />;
}