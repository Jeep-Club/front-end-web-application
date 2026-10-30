import { publicationFeedParamsSchema } from '@/schemas/publications/feed';
import { parsePublicationFeedFilters, updatePublicationFeedFilters } from '@/utils/publications/feedFilters';

const from = '2026-10-29T12:00:00.123456Z';
describe('Filtros absolutos do feed', () => {
    it('preserva microssegundos e aceita igualdade e limite isolado', () => {
        expect(publicationFeedParamsSchema.parse({ page: 0, size: 3, publishedFrom: from, publishedTo: from }).publishedFrom).toBe(from);
        expect(publicationFeedParamsSchema.safeParse({ page: 0, size: 50, publishedTo: from }).success).toBe(true);
    });
    it.each(['2026-02-30T12:00:00Z', '2026-10-29T12:00:00', '2026-10-29', '2026-10-29T24:00:00Z'])('rejeita instante inválido %s', publishedFrom => {
        expect(publicationFeedParamsSchema.safeParse({ page: 0, size: 12, publishedFrom }).success).toBe(false);
    });
    it('compara frações dentro do mesmo milissegundo', () => {
        expect(publicationFeedParamsSchema.safeParse({ page: 0, size: 12, publishedFrom: from, publishedTo: '2026-10-29T12:00:00.123455Z' }).success).toBe(false);
        expect(publicationFeedParamsSchema.safeParse({ page: 0, size: 12, publishedFrom: '2026-10-29T12:00:00.1Z', publishedTo: '2026-10-29T12:00:00.100Z' }).success).toBe(true);
    });
    it.each(['type=ALL', 'type=NOTICE&type=EVENT', 'publishedFrom=bad', 'publishedTo=x&publishedTo=y'])('não corrige URL inválida silenciosamente %s', query => {
        expect(parsePublicationFeedFilters(new URLSearchParams(query)).success).toBe(false);
    });
    it('atualiza filtro sem perder precisão nem parâmetros alheios', () => {
        const params = updatePublicationFeedFilters(new URLSearchParams('type=NOTICE&publication=7&page=2&size=24&other=ok'), { type: 'EVENT', publishedFrom: from });
        expect(params.get('publishedFrom')).toBe(from);
        expect(params.get('other')).toBe('ok');
        expect(params.has('publication')).toBe(false);
        expect(params.has('page')).toBe(false);
        expect(parsePublicationFeedFilters(params).success).toBe(true);
    });
    it.each([{ page: -1, size: 12 }, { page: 0, size: 0 }, { page: 0, size: 51 }])('valida paginação %j', input => {
        expect(publicationFeedParamsSchema.safeParse(input).success).toBe(false);
    });
});
