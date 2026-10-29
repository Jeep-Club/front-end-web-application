/** Numeric amount with an optional decimal separator and at most two cents digits. */
export function maskServiceAmount(value: string): string {
    const cleaned = value.replace(/[^\d,.]/g, '');
    const separator = cleaned.search(/[,.]/);
    if (separator < 0) return cleaned.slice(0, 13);
    const integer = cleaned.slice(0, separator).slice(0, 13) || '0';
    const cents = cleaned.slice(separator + 1).replace(/\D/g, '').slice(0, 2);
    return `${integer},${cents}`;
}
