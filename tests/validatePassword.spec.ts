import { validPassword, isValidPassword } from '@/utils/validate/validatePassword';

describe('validatePassword', () => {
    // Teste Estrutural: Fluxo de Controle (Nó de saída antecipada)
    it('Estrutural: Deve retornar falsos se a senha for vazia, nula ou undefined', () => {
        expect(validPassword("")).toEqual({
            hasMinLength: false, hasNumber: false, hasLowercase: false, hasUppercase: false, hasSpecialChar: false
        });
    });

    // Testes Funcionais: Partição de Equivalência (Classes Inválidas)
    it('Funcional (Equivalência): Senha sem tamanho mínimo (< 8)', () => {
        expect(validPassword("A1!a").hasMinLength).toBe(false);
    });

    it('Funcional (Equivalência): Senha sem número', () => {
        expect(validPassword("SenhaForte!").hasNumber).toBe(false);
    });

    it('Funcional (Equivalência): Senha sem letra minúscula', () => {
        expect(validPassword("SENHA123!").hasLowercase).toBe(false);
    });

    it('Funcional (Equivalência): Senha sem letra maiúscula', () => {
        expect(validPassword("senha123!").hasUppercase).toBe(false);
    });

    it('Funcional (Equivalência): Senha sem caractere especial', () => {
        expect(validPassword("Senha1234").hasSpecialChar).toBe(false);
    });

    // Teste Funcional/Estrutural: Caminho de Sucesso
    it('Funcional/Estrutural: Deve validar corretamente uma senha forte (Todos os nós verdadeiros)', () => {
        const valid = validPassword("Senha@123");
        expect(Object.values(valid).every(v => v === true)).toBe(true);
        expect(isValidPassword("Senha@123")).toBe(true);
    });
});