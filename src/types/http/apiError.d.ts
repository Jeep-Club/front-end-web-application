// formato padrao das respostas em estouros de erros
interface ApiErrorResponse {
    timestamp: string;
    code: string;
    message: string;
    // TODO: vamos ter message-ptbr onde o backend envia as mensagens em portugues para mostar pro usuario, e vamos mudar toda as referencias de message para 
    status: number;
}

interface ApiFieldError {
    field: string;
    message: string;
    rejectedValue: unknown;
}

// 400 quando da erro de valição de campo
interface ApiValidationErrorResponse extends ApiErrorResponse {
    errors: ApiFieldError[];
}
