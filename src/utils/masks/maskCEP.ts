export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}
