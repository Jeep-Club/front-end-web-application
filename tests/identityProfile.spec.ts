import { meProfileResponseSchema } from '@/schemas/user/profile';
import { adminUserSchema } from '@/schemas/admin/users';

const identity = {
    id: 1, name: 'Administrador Teste', cpf: '12345678909', email: 'admin@localhost.com',
    birthDate: null, rg: null, phoneNumber: null, profilePhotoStorageKey: null,
    status: 'ACTIVE', createdAt: '2026-10-07T12:00:00Z', disabledAt: null, updatedAt: null,
};

describe('current API identity contract', () => {
    it('accepts a profile without a stored photo', () => {
        expect(meProfileResponseSchema.parse(identity).profilePhotoUrl).toBeNull();
    });
    it('resolves a profile photo through the authenticated same-origin proxy', () => {
        const profile = meProfileResponseSchema.parse({ ...identity, profilePhotoStorageKey: 'images/2026/photo.png' });
        expect(profile.profilePhotoUrl).toBe('/api/media/images?key=images%2F2026%2Fphoto.png');
    });
    it('accepts an administrator user from the current API', () => {
        expect(adminUserSchema.parse(identity)).toMatchObject({ id: 1, profilePhotoUrl: null });
    });
});
