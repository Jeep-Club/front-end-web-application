import { adminEventSchema, adminNoticeSchema, adminServiceSchema, eventUpdateSchema } from '@/schemas/publications/admin';
import { publicationGallerySchema } from '@/schemas/publications/create';

const images = [{ storageKey: 'images/2026/10/30/550e8400-e29b-41d4-a716-446655440000.jpg', position: 0, primary: true }];
const base = { id: 1, authorUserId: 7, title: 'Título', content: 'Conteúdo', images };
const dates = { createdAt: '2026-10-30T12:00:00Z', updatedAt: '2026-10-30T12:00:00Z', publishedAt: null, archivedAt: null };
describe('Contratos administrativos específicos', () => {
    it('preserva os campos próprios de cada tipo', () => {
        expect(adminEventSchema.parse({ ...base, publicationStatus: 'DRAFT', eventStatus: 'OPEN', startsAt: dates.createdAt, endsAt: null }).startsAt).toBe(dates.createdAt);
        expect(adminNoticeSchema.parse({ ...base, ...dates, status: 'ARCHIVED' }).status).toBe('ARCHIVED');
        expect(adminServiceSchema.parse({ ...base, ...dates, status: 'PUBLISHED', sourceRequestId: 9, amount: 10, contactPhone: '12999999999' }).sourceRequestId).toBe(9);
    });
    it('separa PATCH editorial de agenda e null', () => {
        expect(eventUpdateSchema.parse({ title: 'Novo' })).toEqual({ title: 'Novo' });
        expect(eventUpdateSchema.parse({ endsAt: null })).toEqual({ endsAt: null });
        expect(eventUpdateSchema.safeParse({ title: null }).success).toBe(false);
        expect(eventUpdateSchema.safeParse({ startsAt: null }).success).toBe(false);
    });
    it('rejeita galerias inválidas e permite capa fora da primeira posição', () => {
        expect(publicationGallerySchema.safeParse([{ ...images[0], storageKey: 'https://example.com/image.jpg' }]).success).toBe(false);
        expect(publicationGallerySchema.safeParse([images[0], { ...images[0], position: 1 }]).success).toBe(false);
        expect(publicationGallerySchema.safeParse([{ ...images[0], primary: false }, { ...images[0], storageKey: images[0].storageKey.replace('0000.jpg', '0001.jpg'), position: 1 }]).success).toBe(true);
    });
});
