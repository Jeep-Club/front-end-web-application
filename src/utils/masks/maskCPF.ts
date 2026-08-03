/**
 * Aplica a máscara de CPF no formato 000.000.000-00.
 *
 * Regras:
 * - remove caracteres não numéricos
 * - limita a 11 dígitos
 * - aplica pontos e hífen conforme o padrão brasileiro
 *
 * Objetivo:
 * - formatar o valor digitado pelo usuário em tempo real
 * - exibir o CPF de forma legível
 *
 * Exemplo:
 * - entrada: "12345678901"
 * - saída: "123.456.789-01"
 */
export function maskCPF(value: string): string {
  const cleaned = unMaskCPF(value).slice(0, 11);

  return cleaned
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Remove a máscara do CPF, retornando apenas os números.
 *
 * Regras:
 * - remove todos os caracteres não numéricos (pontos, hífens, letras, espaços, etc.)
 *
 * Objetivo:
 * - limpar o valor formatado para armazenamento no banco de dados
 * - preparar a string para envio a APIs/backend
 * - facilitar a validação matemática dos dígitos verificadores
 *
 * Exemplo:
 * - entrada: "123.456.789-01"
 * - saída: "12345678901"
 */
export function unMaskCPF(value: string): string {
  // A expressão regular /\D/g busca globalmente tudo o que não for dígito numérico
  return value.replace(/\D/g, "");
}