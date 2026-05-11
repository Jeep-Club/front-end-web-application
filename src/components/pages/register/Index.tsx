import { Painel } from './Painel';
import { RegisterForm } from './Forms';

export default function Step1Form() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <Painel />
            <RegisterForm />
        </div>
    );
}