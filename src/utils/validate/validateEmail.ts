/**
 * Valida se o valor informado é um email válido.
 * 
 * Regras aplicadas:
 * - deve conter um "@" e um domínio válido
 * - não pode conter espaços em branco
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(value);
}