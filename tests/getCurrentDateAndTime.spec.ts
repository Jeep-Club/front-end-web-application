import { getCurrentDateAndTime } from '@/utils/several/getCurrentDateAndTime';

describe('getCurrentDateAndTime', () => {
  beforeAll(() => {
    // Congela no dia 25 de Dezembro de 2024 às 15:30:45
    jest.useFakeTimers().setSystemTime(new Date('2024-12-25T15:30:45Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Estrutural: Garante que todos os nós de montagem do objeto ocorrem corretamente', () => {
    const result = getCurrentDateAndTime();
    
    expect(result.year).toBe(2024);
    expect(result.month).toBe("12");
    expect(result.day).toBe("25");
    expect(result.hourNumber).toBe(15);
    expect(result.minute).toBe("30");
    expect(result.second).toBe("45");
    // Garante que o array de dias da semana foi acessado corretamente
    expect(result.daysOfWeek.length).toBe(7); 
  });
});