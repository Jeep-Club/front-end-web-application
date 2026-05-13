/**
 * Aplica a máscara de telefone brasileiro.
 *
 * Regras:
 * - remove caracteres não numéricos
 * - limita a 11 dígitos
 * - adiciona parênteses no DDD
 * - adiciona hífen no número
 *
 * Formatos:
 * - celular: (11) 99999-9999
 * - fixo: (11) 9999-9999
 *
 * Objetivo:
 * - formatar o telefone em tempo real
 * - melhorar legibilidade do campo
 *
 * Exemplos:
 * - entrada: "11999999999"
 * - saída: "(11) 99999-9999"
 *
 * - entrada: "1133334444"
 * - saída: "(11) 3333-4444"
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  // Celular com 9 dígitos
  if (cleaned.length > 10) {
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  }

  // Telefone fixo
  return cleaned
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
}