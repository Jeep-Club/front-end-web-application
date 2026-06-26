// tests/validateCPF.spec.ts
import { isValidCPF } from '@/utils/validate/validateCPF';

describe('validateCPF', () => {
  // Estrutural: Retornos iniciais
  it('Estrutural: Falha em tamanho diferente de 11', () => {
    expect(isValidCPF("123")).toBe(false);
    expect(isValidCPF("12345678901234")).toBe(false);
  });

  it('Estrutural: Falha em sequência repetida (Regex branch)', () => {
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("999.999.999-99")).toBe(false);
  });

  // Estrutural/Matemático: Validação dos cálculos do Dígito Verificador (DV)
  it('Estrutural: Falha no primeiro DV', () => {
    expect(isValidCPF("529982247-99")).toBe(false); 
  });

  it('Estrutural: Passa no primeiro DV mas falha no segundo', () => {
    // Alterando o último dígito de um CPF válido
    expect(isValidCPF("52998224720")).toBe(false); 
  });

  it('Estrutural (Cobertura do ternário remainder < 2): DV resultando em 0', () => {
    // CPF válido onde o cálculo do resto força a matemática retornar 0
    expect(isValidCPF("00000000191")).toBe(true); 
  });

  it('Funcional (Caminho Feliz): CPF completamente válido formatado e não formatado', () => {
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });
});