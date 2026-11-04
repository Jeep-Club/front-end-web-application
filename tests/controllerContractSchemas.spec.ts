import { roleResponseSchema } from '@/schemas/authorization/detail';
import { vehicleListItemSchema } from '@/schemas/vehicles/list';
import { vehicleStatusSchema } from '@/schemas/vehicles/include';
import { identityMeResponseSchema } from '@/schemas/auth/me/me';
import { adminTemporaryPasswordResponseSchema } from '@/schemas/auth/recovery';
import { resetPasswordRequestSchema } from '@/schemas/auth/reset-password/resetPasswordRequest';

it('matches archived roles and rejects the obsolete DELETED wire status', () => {
    const role = { id: 1, name: 'Arquivado', kind: 'CUSTOM', description: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: null, deletedAt: null };
    expect(roleResponseSchema.parse({ ...role, status: 'ARCHIVED' }).status).toBe('ARCHIVED');
    expect(roleResponseSchema.safeParse({ ...role, status: 'DELETED' }).success).toBe(false);
});

it('preserves the vehicle status sent in list DTOs and accepts archived details', () => {
    expect(vehicleStatusSchema.parse('ARCHIVED')).toBe('ARCHIVED');
    const item = { id: 1, nickname: null, plate: 'ABC1234', photo: null, modelYear: 2020, model: 'Jeep', color: 'Verde', status: 'ARCHIVED' };
    expect(vehicleListItemSchema.parse(item).status).toBe('ARCHIVED');
    expect(vehicleStatusSchema.safeParse('SOFT_DELETED').success).toBe(false);
});

it('keeps the actual membership number, its leading zeros and nullable identity fields', () => {
    const identity = { id: 900, name: 'Membro', birthDate: null, email: null, cpf: '12345678909', rg: null, phoneNumber: null, profilePhotoStorageKey: null, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', disabledAt: null, updatedAt: null, membershipNumber: '027', profileCompletionPending: true };
    expect(identityMeResponseSchema.parse(identity)).toMatchObject({ id: 900, email: null, membershipNumber: '027', profileCompletionPending: true });
    expect(identityMeResponseSchema.parse({ ...identity, membershipNumber: null }).membershipNumber).toBeNull();
});

it('accepts TemporaryPasswordAdminResponseDTO without inventing a userId from the API', () => {
    const response = { temporaryPassword: 'TestOnly123!', status: 'OPEN', method: 'ADMIN_TEMPORARY_PASSWORD', createdAt: '2026-01-01T00:00:00Z', expiresAt: '2026-01-02T00:00:00Z', resolvedAt: null, cancelledAt: null };
    expect(adminTemporaryPasswordResponseSchema.parse(response)).toEqual(response);
    expect(adminTemporaryPasswordResponseSchema.safeParse({ temporaryPassword: 'TestOnly123!' }).success).toBe(false);
});

it('uses the API password length bounds and validates confirmation locally', () => {
    for (const length of [8, 100]) expect(resetPasswordRequestSchema.safeParse({ password: 'a'.repeat(length), confirmPassword: 'a'.repeat(length) }).success).toBe(true);
    for (const length of [7, 101]) expect(resetPasswordRequestSchema.safeParse({ password: 'a'.repeat(length), confirmPassword: 'a'.repeat(length) }).success).toBe(false);
    expect(resetPasswordRequestSchema.safeParse({ password: 'Different123!', confirmPassword: 'Mismatch123!' }).success).toBe(false);
});
