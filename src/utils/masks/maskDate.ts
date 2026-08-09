export interface MaskDateOptions {
  dateStyle?: "short" | "medium" | "long" | "full";
  fallback?: string;
  includeTime?: boolean;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Formata datas no padrão brasileiro e evita a mudança de dia causada pelo
 * fuso horário ao receber valores no formato YYYY-MM-DD.
 */
export function maskDate(
  value: string | Date | null | undefined,
  options: MaskDateOptions = {},
): string {
  const {
    dateStyle = "short",
    fallback = "—",
    includeTime,
  } = options;

  if (!value) return fallback;

  const isDateOnly = typeof value === "string" && DATE_ONLY_PATTERN.test(value);
  const normalizedValue = isDateOnly ? `${value}T12:00:00` : value;
  const date = normalizedValue instanceof Date
    ? normalizedValue
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return fallback;

  const shouldIncludeTime = includeTime ?? !isDateOnly;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle,
    ...(shouldIncludeTime ? { timeStyle: "short" as const } : {}),
  }).format(date);
}
