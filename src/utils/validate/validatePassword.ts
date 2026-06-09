/**
 * Valida se uma senha atende aos critérios mínimos de segurança.
 * @param password - A senha a ser validada
 * @returns  Um objeto indicando quais critérios a senha atende
 * 
 * Critérios de validação:
 * - Mínimo de 8 caracteres
 * - Pelo menos um número
 * - Pelo menos uma letra minúscula
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um caractere especial
 * Exemplo de uso:
 * const result = validPassword("Senha-1#");
 * console.log(result);
 * // { hasMinLength: true, hasNumber: true, hasLowercase: true, hasUppercase: true, hasSpecialChar: true }
 * 
 */
export function validPassword(password: string) {
  if (!password) return {
    hasMinLength: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false
  };

  // Lista de critérios individuais (Regex)
  const hasMinLength = /.{8,}/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/.test(password);

  // Retorna true ou false para cada critério
  return { hasMinLength, hasNumber, hasLowercase, hasUppercase, hasSpecialChar };
}

export function isValidPassword(password: string): boolean {
  const { hasMinLength, hasNumber, hasLowercase, hasUppercase, hasSpecialChar } = validPassword(password);
  return hasMinLength && hasNumber && hasLowercase && hasUppercase && hasSpecialChar;
}