/**
 * Aplica a máscara de telefone brasileiro progressivamente.
 * Suporta telefones fixos (8 dígitos) e celulares (9 dígitos) com DDD.
 * Exemplos: (11) 99999-9999 ou (11) 5555-5555
 * @param value - String bruta vinda do input
 */
export function maskPhoneNumber(value: string): string {
  // Remove tudo o que não for número e limita a 11 dígitos (DDD + Celular)
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  return cleaned
    // Adiciona o parênteses inicial e fecha o DDD: "119" -> "(11) 9"
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    
    // Adiciona o hífen dinâmico. Se tiver 11 dígitos (celular), deixa 5 números antes do hífen.
    // Se tiver 10 dígitos (fixo), a regex de baixo vai ajustar o hífen para 4 números no final.
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}