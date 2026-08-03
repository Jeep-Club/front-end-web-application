// tests/validateBirthDate.spec.ts
import { isValidBirthDate } from '@/utils/validate/validateBirthDate';

describe('validateBirthDate', () => {
  beforeAll(() => {
    // Congela o tempo em 01/01/2024 para garantir testes determinísticos
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Testes Estruturais (Caminhos de erro iniciais)
  it('Estrutural: Caminho sem data enviada', () => {
    expect(isValidBirthDate("")).toBe(false);
  });

  it('Estrutural: Caminho de data estruturalmente inválida', () => {
    expect(isValidBirthDate("2024-15-32")).toBe(false); 
  });

  // Testes Funcionais: Análise de Valor Limite
  it('Funcional (Limite Superior): Data no futuro', () => {
    expect(isValidBirthDate("2024-01-02")).toBe(false); // Amanhã
  });

  it('Funcional (Limite Atual): Exatamente hoje (válido se sem restrição)', () => {
    expect(isValidBirthDate("2024-01-01")).toBe(true);
  });

  it('Funcional (Limite Máximo de Idade): Rejeita > 130 anos', () => {
    expect(isValidBirthDate("1893-12-31")).toBe(false); // 131 anos
    expect(isValidBirthDate("1894-01-01")).toBe(true);  // Exatamente 130 anos
  });

  // Testes Estruturais: Fluxo de Dados de Cálculo de Idade
  it('Estrutural (Cobertura de Branch): Aniversário ainda não ocorreu no ano atual (mês menor)', () => {
    // Nasceu em fevereiro, hoje é janeiro (monthDifference < 0)
    expect(isValidBirthDate("2000-02-01", 24)).toBe(false); // Tem 23, rejeita
  });

  it('Estrutural (Cobertura de Branch): Aniversário no mesmo mês, mas dia futuro', () => {
    // Nasceu em 2 de janeiro, hoje é 1 de janeiro
    expect(isValidBirthDate("2000-01-02", 24)).toBe(false); // Faltam dias para 24
  });

  // Testes Funcionais com parâmetro extra
  it('Funcional (Valor Limite com MinAge): Exatamente 18 anos e menor de 18', () => {
    expect(isValidBirthDate("2006-01-01", 18)).toBe(true); // Exatamente 18
    expect(isValidBirthDate("2006-01-02", 18)).toBe(false); // Falta 1 dia
  });
});