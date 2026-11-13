import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeedMetadata } from '@/components/pages/feed/FeedMetadata';
import { feedDate, publicationReadError, publicationReadRetry } from '@/components/pages/feed/feedDisplay';
import { ActionError } from '@/utils/http/ActionError';
import { publicationFeedItemSchema } from '@/schemas/publications/feed';

it('exibe início, fim e status retornado sem recalculá-lo', () => {
    const publication = publicationFeedItemSchema.parse({ id: 1, authorUserId: 7, title: 'Evento', content: 'Texto', type: 'EVENT', primaryImage: null, publishedAt: '2026-10-29T12:00:00Z', likeCount: 0, commentCount: 0, likedByMe: false, details: { startsAt: '2026-10-30T12:00:00Z', endsAt: '2026-10-30T13:00:00Z', status: 'CANCELLED' } });
    const html = renderToStaticMarkup(createElement(FeedMetadata, { publication }));
    expect(html).toContain('Fim:');
    expect(html).toContain('Cancelado');
    expect(html).toContain('2026-10-30T13:00:00Z');
    expect(feedDate(publication.publishedAt)).toContain('São Paulo');
});
it.each([400, 401, 402, 403, 404])('não repete automaticamente %s', status => {
    const error = new ActionError('Falhou', { status });
    expect(publicationReadRetry(0, error)).toBe(false);
    expect(publicationReadError(error).message).not.toBe('Falhou');
});
it('distingue bloqueio de indisponibilidade e limita repetição transitória', () => {
    expect(publicationReadError(new ActionError('x', { status: 402 })).restricted).toBe(true);
    expect(publicationReadError(new ActionError('x', { status: 503 })).restricted).toBe(false);
    expect(publicationReadRetry(0, new ActionError('x', { status: 503 }))).toBe(true);
    expect(publicationReadRetry(1, new Error('rede'))).toBe(false);
});
