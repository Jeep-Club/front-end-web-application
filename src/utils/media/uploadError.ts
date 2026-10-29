import { extractApiErrorMessage, getApiProblem } from '@/utils/http/apiError';

export function imageUploadErrorMessage(status: number, rawData: unknown): string {
    const problem = getApiProblem({ rawData, status });
    if (status === 413 || ['IMAGE_TOO_LARGE', 'FILE_TOO_LARGE', 'PAYLOAD_TOO_LARGE', 'MAX_UPLOAD_SIZE_EXCEEDED'].includes(problem?.code ?? '')) {
        return 'A imagem ultrapassa o limite de tamanho aceito pelo servidor. Reduza o arquivo ou escolha uma foto menor e tente novamente.';
    }
    if (problem?.code === 'INVALID_IMAGE') {
        return 'Esta imagem não pôde ser aceita. Escolha uma foto JPEG, PNG ou WebP de até 5 MiB e tente novamente.';
    }
    if (status === 415) return 'Formato de imagem não aceito. Escolha uma foto JPEG, PNG ou WebP.';
    return extractApiErrorMessage({ rawData, status }, 'Não foi possível enviar a imagem agora. Tente novamente em instantes.');
}
