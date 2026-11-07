import z from "zod";
import { identityMeResponseSchema } from '../auth/me/me';
import { getMediaImageUrl } from '@/utils/media/imageUrl';

export const userStatusSchema = z.enum([
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED',
    'DISABLED',
]).transform((status): UserStatus => (status === 'DISABLED' ? 'INACTIVE' : status));

export const getUserProfileResponseSchema: z.ZodType<GetUserProfileResponse> = z.object({
    id: z.number(),
    name: z.string(),
    birthDate: z.string().nullable(),
    email: z.string(),
    membershipNumber: z.string().nullish(),
    cpf: z.string(),
    rg: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    profilePhotoUrl: z.string().nullable(),
    status: userStatusSchema,
    createdAt: z.string(),
    lastLoginAt: z.string().nullable(),
});


export const meProfileResponseSchema: z.ZodType<MeProfileResponse> = identityMeResponseSchema.transform(user => ({
    ...user,
    profilePhotoUrl: getMediaImageUrl(user.profilePhotoStorageKey) || null,
}));

