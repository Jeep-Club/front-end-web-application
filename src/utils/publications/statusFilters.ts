export const publicationStatusOptions = [
    { value: "ALL", label: "Todos os estados" },
    { value: "DRAFT", label: "Rascunhos" },
    { value: "PUBLISHED", label: "Publicados" },
    { value: "ARCHIVED", label: "Arquivados" },
] as const;

export type PublicationStatusFilter = typeof publicationStatusOptions[number]["value"];

export function parsePublicationStatus(value: string | null | undefined): PublicationStatusFilter {
    return publicationStatusOptions.find((option) => option.value === value)?.value ?? "ALL";
}
