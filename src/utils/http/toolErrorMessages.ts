const CODE_DEFAULT_MESSAGES: Record<string, string> = {
    TOOL_OWNER_NOT_FOUND: "Proprietário da ferramenta não encontrado.",
    TOOL_OWNER_DISABLED: "Proprietário da ferramenta está desabilitado e não pode receber novas ferramentas.",
    TOOL_NOT_FOUND: "Ferramenta não encontrada.",
    TOOL_ACCESS_DENIED: "Você não tem permissão para realizar esta ação.",
    TOOL_ALREADY_DELETED: "Esta ferramenta já foi excluída.",
    TOOL_LIFECYCLE_CONFLICT: "Ferramenta arquivada exige desarquivamento prévio antes desta operação.",
    TOOL_CONCURRENT_MODIFICATION: "A ferramenta foi alterada simultaneamente. Tente novamente.",
    INVALID_TOOL_STATUS: "Status da ferramenta inválido para esta operação.",
};

const ENGLISH_DETAIL_TRANSLATIONS: Array<[RegExp, string]> = [
    [/^Tool not found\.$/i, "Ferramenta não encontrada."],
    [/^Archived record requires explicit unarchive before this operation\.$/i, "Ferramenta arquivada exige desarquivamento prévio antes desta operação."],
    [/^Only an archived record can be unarchived\.$/i, "Apenas uma ferramenta arquivada pode ser desarquivada."],
    [/^Tool with id \d+ is already deleted\.$/i, "Esta ferramenta já foi excluída."],
    [/^Concurrent modification; retry the operation\.$/i, "A ferramenta foi alterada simultaneamente. Tente novamente."],
];

export function resolveToolErrorMessage(message: string, code?: string): string {

    for (const [pattern, translation] of ENGLISH_DETAIL_TRANSLATIONS) {
        if (pattern.test(message)) {
            return translation;
        }
    }

    if (!message.trim() && code && CODE_DEFAULT_MESSAGES[code]) return CODE_DEFAULT_MESSAGES[code];

    return message;
}
