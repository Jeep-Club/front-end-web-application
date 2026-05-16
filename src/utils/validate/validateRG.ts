/**
 * Valida de forma genérica se a estrutura do RG é aceitável no Brasil.
 * Aceita de 7 a 9 dígitos numéricos, permitindo 'X' ou 'x' apenas como último caractere.
 * @param rg - O valor vindo do input
 * @returns true se a estrutura for válida, false caso contrário
 */
export const isValidRG = (rg: string): boolean => {
  if (!rg) return false;

  // 1. Remove pontos, traços e espaços, mantendo letras e números
  const cleanRG = rg.replace(/[\.\-\s]/g, "").toUpperCase();

  // 2. Verifica o tamanho: os RGs no Brasil variam geralmente entre 7 e 9 caracteres
  if (cleanRG.length < 7 || cleanRG.length > 9) return false;

  // 3. Regra de caracteres repetidos óbvios (ex: 0000000, 1111111)
  if (/^(\d)\1+$/.test(cleanRG)) return false;

  // 4. Valida a estrutura: pode ter números e terminar opcionalmente com X
  // ^\d{6,8} -> Começa com 6 a 8 números
  // [\dX]$ -> Termina com um número OU a letra X
  const rgPattern = /^\d{6,8}[\dX]$/;
  
  return rgPattern.test(cleanRG);
};