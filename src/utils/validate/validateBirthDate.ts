/**
 * Verifica se uma string de data (YYYY-MM-DD) é uma data de nascimento válida.
 * @param dateString - Data vinda do input tipo "date"
 * @param minAge - Idade mínima opcional (ex: 18)
 * @returns true se a data for válida, false caso contrário
 */
export const isValidBirthDate = (dateString: string, minAge?: number): boolean => {
  if (!dateString) return false;

  const birthDate = new Date(dateString);
  
  // 1. Verifica se a estrutura da data é válida (ex: evita 2026-02-31)
  if (isNaN(birthDate.getTime())) return false;

  const today = new Date();
  
  // Zera as horas para comparar apenas os dias
  today.setHours(0, 0, 0, 0);
  birthDate.setHours(0, 0, 0, 0);

  // 2. Não pode ser uma data no futuro
  if (birthDate > today) return false;

  // 3. Cálculo exato da idade considerando mês e dia
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // 4. Limite máximo de idade (evita anos errados como 1890)
  if (age > 130) return false;

  // 5. Verificação de idade mínima (se passada por parâmetro)
  if (minAge !== undefined && age < minAge) return false;

  return true;
};