// Espelha o formato RFC 9457 Problem Details (Content-Type:
// application/problem+json) que o backend usa em toda resposta de erro.
// `code` e' o campo estavel e independente de idioma pra decisoes
// programaticas; `title`/`detail`/`errors[].message` sao textos ja
// localizados (Accept-Language) e servem so pra apresentacao.
interface ApiFieldError {
    field: string;
    code: string;
    message: string;
}

interface ApiProblem {
    type?: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    code: string;
    timestamp: string;
    errors?: ApiFieldError[];
}
