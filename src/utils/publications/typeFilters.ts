/** Restringe a seleção aos tipos permitidos e mantém ao menos um tipo disponível. */
export function resolvePublicationTypes(available: string[], requested: string[]): string[] {
    const selected = available.filter((type) => requested.includes(type));
    return selected.length ? selected : available;
}

export function togglePublicationType(selected: string[], type: string): string[] {
    if (!selected.includes(type)) return [...selected, type];
    return selected.length > 1 ? selected.filter((entry) => entry !== type) : selected;
}