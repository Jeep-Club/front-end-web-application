import { maskCPF, unMaskCPF } from '@/utils/masks/maskCPF';

describe('maskCPF & unMaskCPF', () => {
  describe('unMaskCPF', () => {
    it('Funcional/Estrutural: Remove tudo que não for dígito numérico', () => {
      expect(unMaskCPF("123.456.789-01")).toBe("12345678901");
      expect(unMaskCPF("abc123!@#456")).toBe("123456");
    });
  });

  describe('maskCPF', () => {
    it('Funcional: Formata CPFs com exatamente 11 dígitos', () => {
      expect(maskCPF("12345678901")).toBe("123.456.789-01");
    });

    it('Estrutural (Valor Limite): Corta strings maiores que 11 dígitos antes de aplicar a máscara', () => {
      expect(maskCPF("12345678901234")).toBe("123.456.789-01");
    });

    it('Funcional (Incompleto): Formata parcialmente enquanto o usuário digita', () => {
      expect(maskCPF("12345")).toBe("123.45"); // Máscara parcial
    });
  });
});