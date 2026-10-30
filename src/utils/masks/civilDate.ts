/** Formata somente os dígitos de uma data civil em dd/mm/aaaa. */
export function maskCivilDate(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

/** Converte uma data civil válida para YYYY-MM-DD, sem conversão de fuso. */
export function parseCivilDate(value: string): string | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    const [, day, month, year] = match;
    const y = Number(year), m = Number(month), d = Number(day);
    if (y < 1 || m < 1 || m > 12 || d < 1) return null;
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d <= days[m - 1] ? `${year}-${month}-${day}` : null;
}
