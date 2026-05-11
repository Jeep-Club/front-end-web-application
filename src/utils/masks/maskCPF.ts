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
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  return cleaned
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}