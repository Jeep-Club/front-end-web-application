'use server';

import { birthDateSchema } from '@/schemas/auth/user/birthDate';
import { dependentResponseSchema,dependentsResponseSchema } from '@/schemas/dependents';
import { medicalProfileResponseSchema } from '@/schemas/profile/medical-profile';
import actionFetchWrapper from '@/services/fetchWrapper/actionFetchWrapper';
import { HttpAPIRoutes } from '@/utils/http/api';
import { z } from 'zod';
export async function listDependentsAction(): Promise<MemberDependent[]> { return (await actionFetchWrapper<MemberDependent[]>({ url: HttpAPIRoutes.DEPENDENTS_MEMBER, method: 'GET', schema: dependentsResponseSchema })).data }
export async function createDependentAction(data: CreateMemberDependentRequest): Promise<MemberDependent> { birthDateSchema.parse(data.birthDate); return (await actionFetchWrapper<MemberDependent>({ url: HttpAPIRoutes.DEPENDENTS_MEMBER, method: 'POST', schema: dependentResponseSchema, body: JSON.stringify(data) })).data }
export async function getDependentMedicalProfileAction(id: number): Promise<MedicalProfile | null> { try { return (await actionFetchWrapper<MedicalProfile>({ url: HttpAPIRoutes.MEDICAL_PROFILE_DEPENDENT.replace('{dependentId}', String(id)), method: 'GET', schema: medicalProfileResponseSchema })).data } catch (error) { if (error && typeof error === 'object' && 'status' in error && error.status === 404) return null; throw error; } }
export async function saveDependentMedicalProfileAction(id: number, data: MedicalProfileRequest): Promise<MedicalProfile> { return (await actionFetchWrapper<MedicalProfile>({ url: HttpAPIRoutes.MEDICAL_PROFILE_DEPENDENT.replace('{dependentId}', String(id)), method: 'PUT', schema: medicalProfileResponseSchema, body: JSON.stringify(data) })).data }
export async function updateDependentAction(id: number, data: CreateMemberDependentRequest): Promise<MemberDependent> { birthDateSchema.parse(data.birthDate); return (await actionFetchWrapper<MemberDependent>({ url: `${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`, method: 'PUT', schema: dependentResponseSchema, body: JSON.stringify(data) })).data }
export async function deleteDependentAction(id: number): Promise<void> { await actionFetchWrapper({ url: `${HttpAPIRoutes.DEPENDENTS_MEMBER}/${id}`, method: 'DELETE', schema: z.union([z.literal(''), z.null()]) }) }
