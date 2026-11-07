import { meProfileResponseSchema } from '@/schemas/user/profile';
import {
    adminUpdateUserFormSchema,
    adminUserComplementaryProfileFormSchema,
    adminUserComplementaryProfileSchema,
    adminUserDeletionHistorySchema,
    adminUserSchema,
    adminUserSearchParamsSchema,
} from '@/schemas/admin/users';
import { adminUserInvitationStatusResponseSchema } from '@/schemas/admin/create-user';
import { parseAdminUserSearchParams } from '@/utils/searchParam/admin/user';

const identity = {
    id: 1,
    membershipNumber: '2026001',
    name: 'Administrador Teste',
    cpf: '12345678909',
    email: 'admin@localhost.com',
    birthDate: null,
    rg: null,
    phoneNumber: null,
    profilePhotoStorageKey: null,
    status: 'ACTIVE',
    createdAt: '2026-10-07T12:00:00Z',
    disabledAt: null,
    updatedAt: null,
};

describe('current API identity & admin user management contract', () => {
    it('accepts a profile without a stored photo', () => {
        expect(meProfileResponseSchema.parse(identity).profilePhotoUrl).toBeNull();
    });

    it('resolves a profile photo through the authenticated same-origin proxy', () => {
        const profile = meProfileResponseSchema.parse({ ...identity, profilePhotoStorageKey: 'images/2026/photo.png' });
        expect(profile.profilePhotoUrl).toBe('/api/media/images?key=images%2F2026%2Fphoto.png');
    });

    it('accepts an administrator user with ACTIVE, INACTIVE, ARCHIVED, and legacy DISABLED status', () => {
        expect(adminUserSchema.parse(identity)).toMatchObject({
            id: 1,
            membershipNumber: '2026001',
            status: 'ACTIVE',
            profilePhotoUrl: null,
        });
        expect(adminUserSchema.parse({ ...identity, status: 'INACTIVE' }).status).toBe('INACTIVE');
        expect(adminUserSchema.parse({ ...identity, status: 'ARCHIVED' }).status).toBe('ARCHIVED');
        expect(adminUserSchema.parse({ ...identity, status: 'DISABLED' }).status).toBe('INACTIVE');
    });

    it('validates admin user search filters aligned with AdminUserFilterDTO', () => {
        const parsed = adminUserSearchParamsSchema.parse({
            q: 'Carlos',
            email: 'carlos@',
            phoneNumber: '11999',
            membershipNumber: '0042',
            status: 'ARCHIVED',
            size: '50',
        });
        expect(parsed).toMatchObject({
            q: 'Carlos',
            email: 'carlos@',
            phoneNumber: '11999',
            membershipNumber: '0042',
            status: 'ARCHIVED',
            size: 50,
        });

        const urlQuery = parseAdminUserSearchParams({
            status: 'DISABLED',
            membershipNumber: '125',
            size: '100',
        });
        expect(urlQuery).toMatchObject({
            status: 'INACTIVE',
            membershipNumber: '125',
        });
        expect(urlQuery).not.toHaveProperty('size');
    });

    it('normalizes basic admin user update form and complementary profile form payloads', () => {
        const basic = adminUpdateUserFormSchema.parse({
            name: '  João da Silva  ',
            cpf: '529.982.247-25',
            email: '  joao@exemplo.com ',
            birthDate: '1990-05-10',
            rg: '12.345.678-9',
            phoneNumber: '(11) 98765-4321',
        });
        expect(basic).toEqual({
            name: 'João da Silva',
            cpf: '529.982.247-25',
            email: 'joao@exemplo.com',
            birthDate: '1990-05-10',
            rg: '12.345.678-9',
            phoneNumber: '(11) 98765-4321',
        });

        const complementaryForm = adminUserComplementaryProfileFormSchema.parse({
            occupation: '  Engenheiro ',
            workplace: 'Jeep Club Tamoios',
            postalCode: '01310-100',
            street: 'Av. Paulista',
            number: '1000',
            complement: '',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'sp',
        });
        expect(complementaryForm).toEqual({
            occupation: 'Engenheiro',
            workplace: 'Jeep Club Tamoios',
            postalCode: '01310-100',
            street: 'Av. Paulista',
            number: '1000',
            complement: '',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
        });
    });

    it('parses invitation status, complementary profile, and deletion history', () => {
        expect(
            adminUserInvitationStatusResponseSchema.parse({
                userId: 10,
                invitationStatus: 'INVALIDATED',
            }),
        ).toEqual({ userId: 10, invitationStatus: 'INVALIDATED' });

        expect(
            adminUserComplementaryProfileSchema.parse({
                workProfile: { occupation: null, workplace: null },
                address: {
                    postalCode: null,
                    street: null,
                    number: null,
                    complement: null,
                    neighborhood: null,
                    city: null,
                    state: null,
                },
                profileCompletionPending: true,
                membershipNumber: '2026010',
            }).profileCompletionPending,
        ).toBe(true);

        expect(
            adminUserDeletionHistorySchema.parse({
                originalId: 15,
                previousStatus: 'INACTIVE',
                createdAt: '2026-11-01T12:00:00Z',
                disabledAt: '2026-11-02T12:00:00Z',
                archivedAt: null,
                updatedAt: '2026-11-02T12:00:00Z',
                deletedByUserId: 1,
                deletedAt: '2026-11-05T12:00:00Z',
                reason: null,
                schemaVersion: 1,
            }).originalId,
        ).toBe(15);
    });
});

