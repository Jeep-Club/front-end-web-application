export function maskDecimal(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const numberValue = Number(digits) / 10;
  return numberValue.toFixed(1);
}
