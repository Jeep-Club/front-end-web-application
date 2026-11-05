/** Numeric amount with an optional decimal separator and at most two cents digits. */
export function maskServiceAmount(value: string): string {
    const cleaned = value.replace(/[^\d,.]/g, '');
    const comma = cleaned.lastIndexOf(',');
    const dot = cleaned.lastIndexOf('.');
    const separator = comma >= 0 ? comma : dot;
    if (separator < 0) return cleaned.slice(0, 13);

    // In Brazilian currency, dots before a comma are thousands separators.
    const rawInteger = cleaned.slice(0, separator);
    const integer = rawInteger.replace(/\D/g, '').slice(0, 13) || '0';
    const cents = cleaned.slice(separator + 1).replace(/\D/g, '').slice(0, 2);
    return `${integer},${cents}`;
}

/** Convert a masked Brazilian currency value to a number without losing cents. */
export function parseServiceAmount(value: string): number {
    const normalized = value.trim().replace(/[^\d,.]/g, '');
    const comma = normalized.lastIndexOf(',');
    if (comma >= 0) {
        const integer = normalized.slice(0, comma).replace(/\D/g, '') || '0';
        const cents = normalized.slice(comma + 1).replace(/\D/g, '').slice(0, 2).padEnd(2, '0');
        return Number(`${integer}.${cents}`);
    }

    const dot = normalized.lastIndexOf('.');
    if (dot >= 0) {
        const fraction = normalized.slice(dot + 1).replace(/\D/g, '');
        const integerPart = normalized.slice(0, dot).replace(/\D/g, '') || '0';
        if (fraction.length <= 2) return Number(`${integerPart}.${fraction || '0'}`);
    }

    return Number(normalized.replace(/\D/g, ''));
}
