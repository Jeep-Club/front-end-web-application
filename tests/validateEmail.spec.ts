import { isValidEmail } from '@/utils/validate/validateEmail';

describe('validateEmail', () => {
  it('Funcional (Equivalência): Emails válidos', () => {
    expect(isValidEmail("teste@dominio.com")).toBe(true);
    expect(isValidEmail("nome.sobrenome@empresa.com.br")).toBe(true);
  });

  it('Funcional (Equivalência): Emails inválidos', () => {
    expect(isValidEmail("testesemarroba.com")).toBe(false);
    expect(isValidEmail("teste@dominio")).toBe(false); // sem TLD (.com)
    expect(isValidEmail(" teste@dominio.com ")).toBe(false); // com espaços
  });
});