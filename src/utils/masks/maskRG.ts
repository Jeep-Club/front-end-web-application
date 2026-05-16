/**
 * Aplica a máscara de RG progressivamente (Ex: 12.345.678-X)
 * @param value - String bruta vinda do input
 * 
 * Observações:
 * - Segue o formato tradicional de RG no Brasil para o estado de São Paulo, que pode variar entre 7 e 9 caracteres, com pontos e hífen.
 * - formato São Paulo/padrão federal GG.MMM.MMM-X
 */
export const maskRG = (value: string): string => {
  // 1. Remove tudo o que não for número, mas preserva um 'X' ou 'x' se ele for o último caractere
  let cleanValue = value.replace(/[^\dXx]/g, "");

  // 2. Garante que se houver um 'X', ele só possa existir na última posição de um RG completo
  // Remove 'X' do meio do texto caso o usuário tente digitar fora do lugar
  if (cleanValue.length > 1) {
    const body = cleanValue.slice(0, -1).replace(/[Xx]/g, "");
    const lastChar = cleanValue.slice(-1);
    cleanValue = body + lastChar;
  }

  // 3. Aplica a máscara baseada na quantidade de caracteres digitados
  if (cleanValue.length <= 2) {
    return cleanValue;
  }
  if (cleanValue.length <= 5) {
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  }
  if (cleanValue.length <= 8) {
    return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  }
  
  // Limita o tamanho máximo do RG padrão (9 caracteres: 12.345.678-9)
  return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}-${cleanValue.slice(8, 9)}`;
};