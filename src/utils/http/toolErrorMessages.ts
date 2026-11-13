const CODE_DEFAULT_MESSAGES: Record<string, string> = {
    TOOL_OWNER_NOT_FOUND: "Proprietário da ferramenta não encontrado.",
    TOOL_OWNER_DISABLED: "Proprietário da ferramenta está desabilitado e não pode receber novas ferramentas.",
    TOOL_NOT_FOUND: "Ferramenta não encontrada.",
    TOOL_ACCESS_DENIED: "Você não tem permissão para realizar esta ação.",
    TOOL_ALREADY_DELETED: "Esta ferramenta já foi excluída.",
    TOOL_LIFECYCLE_CONFLICT: "Ferramenta arquivada exige desarquivamento prévio antes desta operação.",
    TOOL_CONCURRENT_MODIFICATION: "A ferramenta foi alterada simultaneamente. Tente novamente.",
    INVALID_TOOL_STATUS: "Status da ferramenta inválido para esta operação.",
    DEPENDENT_NOT_FOUND: "Dependente não encontrado.",
    DEPENDENT_OWNER_NOT_FOUND: "Associado titular do dependente não encontrado.",
    DEPENDENT_OWNER_INACTIVE: "Associado titular está inativo e não permite esta operação.",
    DEPENDENT_ACCESS_DENIED: "Você não tem permissão para realizar esta ação sobre o dependente.",
    DEPENDENT_CPF_ALREADY_IN_USE: "O CPF informado já está em uso.",
    DEPENDENT_ALREADY_DELETED: "Este dependente já foi excluído.",
    DEPENDENT_LIFECYCLE_CONFLICT: "Operação não permitida no status atual do dependente ou devido a vínculo ativo em evento.",
    DEPENDENT_CONCURRENT_MODIFICATION: "O dependente foi alterado simultaneamente. Tente novamente.",
    DEPENDENT_INVALID_SEARCH: "Os filtros informados para busca de dependentes são inválidos.",
};

const ENGLISH_DETAIL_TRANSLATIONS: Array<[RegExp, string]> = [
    [/^Tool not found\.$/i, "Ferramenta não encontrada."],
    [/^Dependent with id \d+ was not found\.$/i, "Dependente não encontrado."],
    [/^Dependent with id \d+ is already deleted\.$/i, "Este dependente já foi excluído."],
    [/^Dependent has operational Event participation\.$/i, "Este dependente possui participação ativa em evento não encerrado."],
    [/^Dependent has retained Health\/Event references\.$/i, "Este dependente possui vínculos retidos de saúde ou eventos e não pode ser excluído."],
    [/^Only active dependents can change their photo\.$/i, "Apenas dependentes ativos podem ter a foto alterada."],
    [/^Archived record requires explicit unarchive before this operation\.$/i, "Registro arquivado exige desarquivamento prévio antes desta operação."],
    [/^Only an archived record can be unarchived\.$/i, "Apenas um registro arquivado pode ser desarquivado."],
    [/^Tool with id \d+ is already deleted\.$/i, "Esta ferramenta já foi excluída."],
    [/^Concurrent modification; retry the operation\.$/i, "O registro foi alterado simultaneamente. Tente novamente."],
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
