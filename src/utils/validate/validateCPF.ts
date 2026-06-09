/**
 * Valida se um CPF é válido de acordo com as regras da Receita Federal.
 *
 * Regras aplicadas:
 * - deve conter exatamente 11 dígitos numéricos
 * - não pode ser uma sequência repetida (ex: 111.111.111-11)
 * - os dois dígitos verificadores devem ser válidos
 *
 * Objetivo:
 * - garantir que o CPF informado seja matematicamente válido
 * - evitar envio de dados inválidos para a API
 *
 */
export function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, "");

  if (cpf.length !== 11) return false;

  // Bloqueia CPFs iguais tipo 11111111111
  if (/^(\d)\1+$/.test(cpf)) return false;

   /**
   * Calcula um dígito verificador do CPF.
   *
   * @param base - os primeiros 9 ou 10 dígitos do CPF
   * @param factor - fator inicial de multiplicação (10 ou 11)
   * @returns o dígito verificador calculado
   */
  const calculateDigit = (base: string, factor: number) => {
    let total = 0;

    for (let i = 0; i < base.length; i++) {
      total += parseInt(base[i]) * factor--;
    }

    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calculateDigit(cpf.slice(0, 9), 10);
  const digit2 = calculateDigit(cpf.slice(0, 10), 11);

  return digit1 === Number(cpf[9]) &&
         digit2 === Number(cpf[10]);
}