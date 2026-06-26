import { maskPhoneNumber, unMaskPhoneNumber } from '@/utils/masks/maskPhoneNumber';

describe('maskPhoneNumber & unMaskPhoneNumber', () => {
  describe('unMaskPhoneNumber', () => {
    it('Funcional/Estrutural: Limpa máscara retornando apenas números', () => {
      expect(unMaskPhoneNumber("(11) 98888-7777")).toBe("11988887777");
      expect(unMaskPhoneNumber("+55 (11) a-b-c 1234")).toBe("55111234");
    });
  });

  describe('maskPhoneNumber', () => {
    it('Funcional (Equivalência): Máscara de Celular (11 dígitos)', () => {
      expect(maskPhoneNumber("11988887777")).toBe("(11) 98888-7777");
    });

    it('Funcional (Equivalência): Máscara de Telefone Fixo (10 dígitos)', () => {
      expect(maskPhoneNumber("1133334444")).toBe("(11) 3333-4444");
    });

    it('Estrutural (Valor Limite): Corta strings que excedam 11 dígitos numéricos', () => {
      expect(maskPhoneNumber("11988887777999")).toBe("(11) 98888-7777");
    });

    it('Funcional (Incompleto): Formatação progressiva do DDD', () => {
      expect(maskPhoneNumber("11")).toBe("11"); 
      expect(maskPhoneNumber("119")).toBe("(11) 9"); 
    });
  });
});