// tests/validateBirthDate.spec.ts
import { isValidBirthDate } from '@/utils/validate/validateBirthDate';

describe('validateBirthDate', () => {
  beforeAll(() => {
    // Congela o tempo em 01/01/2024 para garantir testes determinísticos
    jest.useFakeTimers().setSystemTime(new Date(2024, 0, 1, 12));
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

  it('Funcional (Limite Máximo de Idade): Rejeita anos anteriores a 1900', () => {
    expect(isValidBirthDate("1893-12-31")).toBe(false); // 131 anos
    expect(isValidBirthDate("1894-01-01")).toBe(false);  // Antes de 1900
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

describe('birth date calendar boundaries', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12)));
  afterEach(() => jest.useRealTimers());

  it.each(['1899-12-31', '2027-01-01', '2026-10-22', '2026-02-30', '1900-02-29', '02026-01-01', '2026-1-01'])('rejects %s', (value) => {
    expect(isValidBirthDate(value)).toBe(false);
  });
  it.each(['1900-01-01', '2026-10-21', '2000-02-29'])('accepts %s', (value) => {
    expect(isValidBirthDate(value)).toBe(true);
  });
  it('uses the current calendar year dynamically', () => {
    expect(isValidBirthDate('2027-01-01')).toBe(false);
    jest.setSystemTime(new Date(2027, 0, 1, 12));
    expect(isValidBirthDate('2027-01-01')).toBe(true);
  });
});
