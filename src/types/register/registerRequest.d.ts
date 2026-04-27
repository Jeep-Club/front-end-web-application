interface RegisterStep1Data {
    name: string;
    cpf: string;
    email: string;
}

interface RegisterStep2Data {
    password: string;
    confirmPassword: string;
}

interface RegisterFormData extends RegisterStep1Data, RegisterStep2Data {}