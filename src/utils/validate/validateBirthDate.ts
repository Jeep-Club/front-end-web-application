/** Calendar-date bounds shared by birth-date inputs and validation. */
export function getBirthDateInputBounds() {
  const today = new Date();
  const max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return { min: '1900-01-01', max };
}

export const isValidBirthDate = (value: string, minAge?: number): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const { min, max } = getBirthDateInputBounds();
  if (value < min || value > max) return false;
  const birthDate = new Date(year, month - 1, day);
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) return false;
  if (minAge !== undefined) {
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age--;
    if (age < minAge) return false;
  }
  return true;
};
