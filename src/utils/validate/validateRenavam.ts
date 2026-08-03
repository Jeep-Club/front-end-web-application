export function isValidRenavam(value: string): boolean {
  const renavam = value.replace(/\D/g, "");

  if (renavam.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(renavam)) return false;

  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const informedDigit = Number(renavam[10]);

  const sum = renavam
    .slice(0, 10)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);

  const remainder = (sum * 10) % 11;
  const calculatedDigit = remainder === 10 ? 0 : remainder;

  return calculatedDigit === informedDigit;
}
